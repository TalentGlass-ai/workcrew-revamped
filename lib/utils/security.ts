// lib/utils/security.ts
import crypto from 'crypto';

export class SecurityUtils {
  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Hash sensitive data (for logging, not passwords)
   */
  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate webhook signature (Stripe)
   */
  static validateStripeWebhook(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    try {
      const elements = signature.split(',');
      const sigElements: Record<string, string> = {};

      elements.forEach(element => {
        const [key, value] = element.split('=');
        sigElements[key] = value;
      });

      const timestamp = sigElements.t;
      const signatures = sigElements.v1.split(',');

      const signedPayload = `${timestamp}.${payload}`;

      for (const sig of signatures) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(signedPayload)
          .digest('hex');

        if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Validate webhook signature (Razorpay)
   */
  static validateRazorpayWebhook(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Razorpay webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Sanitize input for logging (remove sensitive data)
   */
  static sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'card',
      'cvv',
      'ssn',
      'api_key',
      'private_key',
      'webhook_secret',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeForLogging(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    maxRequests: number = 100
  ): { check: (key: string) => Promise<boolean>; record: (key: string) => Promise<void> } {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return {
      check: async (key: string): Promise<boolean> => {
        const now = Date.now();
        const record = requests.get(key);

        if (!record || now > record.resetTime) {
          return true; // Allow request
        }

        return record.count < maxRequests;
      },

      record: async (key: string): Promise<void> => {
        const now = Date.now();
        const resetTime = now + windowMs;
        const record = requests.get(key);

        if (!record || now > record.resetTime) {
          requests.set(key, { count: 1, resetTime });
        } else {
          record.count++;
        }

        // Clean up old entries periodically
        if (Math.random() < 0.01) { // 1% chance
          for (const [k, v] of requests.entries()) {
            if (now > v.resetTime) {
              requests.delete(k);
            }
          }
        }
      },
    };
  }

  /**
   * PCI compliance: Mask card numbers
   */
  static maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;
    const last4 = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return masked + last4;
  }

  /**
   * GDPR: Check if data contains PII
   */
  static containsPII(data: any): boolean {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const piiFields = [
      'email',
      'phone',
      'address',
      'name',
      'ssn',
      'birthdate',
      'ip_address',
      'user_agent',
    ];

    for (const field of piiFields) {
      if (data[field]) {
        return true;
      }
    }

    // Check nested objects
    for (const key in data) {
      if (typeof data[key] === 'object' && this.containsPII(data[key])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate secure idempotency key
   */
  static generateIdempotencyKey(): string {
    return this.generateUUID();
  }

  /**
   * Validate input against allowlist
   */
  static validateInput(input: string, allowlist: RegExp): boolean {
    return allowlist.test(input);
  }

  /**
   * CSRF token generation and validation
   */
  static generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  static validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;

    try {
      return crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(sessionToken)
      );
    } catch {
      return false;
    }
  }

  /**
   * Content Security Policy helper
   */
  static generateCSP(directives: Record<string, string[]>): string {
    const policies: string[] = [];

    for (const [directive, values] of Object.entries(directives)) {
      policies.push(`${directive} ${values.join(' ')}`);
    }

    return policies.join('; ');
  }

  /**
   * Security headers for API responses
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': this.generateCSP({
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
      }),
    };
  }
}
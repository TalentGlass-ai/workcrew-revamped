// lib/middleware/idempotency.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../prisma';

export interface IdempotencyConfig {
  keyHeader: string; // Header name for idempotency key
  ttlSeconds: number; // How long to store keys
  maxRetries: number; // Max retries for same key
}

const DEFAULT_CONFIG: IdempotencyConfig = {
  keyHeader: 'Idempotency-Key',
  ttlSeconds: 24 * 60 * 60, // 24 hours
  maxRetries: 3,
};

export class IdempotencyMiddleware {
  private config: IdempotencyConfig;

  constructor(config: Partial<IdempotencyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Middleware function for idempotency handling
   */
  async handle(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const idempotencyKey = request.headers.get(this.config.keyHeader);

    if (!idempotencyKey) {
      // If no idempotency key, proceed normally
      return handler();
    }

    // Validate key format (should be UUID or similar)
    if (!this.isValidIdempotencyKey(idempotencyKey)) {
      return NextResponse.json(
        { error: 'Invalid idempotency key format' },
        { status: 400 }
      );
    }

    // Check if key exists in database
    const existingResponse = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingResponse) {
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(existingResponse.createdAt.getTime() + this.config.ttlSeconds * 1000);

      if (now > expiresAt) {
        // Key expired, delete and proceed
        await prisma.idempotencyKey.delete({
          where: { key: idempotencyKey },
        });
      } else {
        // Return cached response
        return new NextResponse(existingResponse.responseBody, {
          status: existingResponse.statusCode,
          headers: {
            'Content-Type': 'application/json',
            ...existingResponse.responseHeaders,
          },
        });
      }
    }

    // Check retry count
    const retryCount = await this.getRetryCount(idempotencyKey);
    if (retryCount >= this.config.maxRetries) {
      return NextResponse.json(
        { error: 'Too many retries for idempotency key' },
        { status: 429 }
      );
    }

    // Increment retry count
    await this.incrementRetryCount(idempotencyKey);

    try {
      // Execute the handler
      const response = await handler();

      // Cache the response
      await this.cacheResponse(idempotencyKey, response);

      return response;
    } catch (error) {
      // On error, don't cache, but log the attempt
      await this.logFailedAttempt(idempotencyKey, error);
      throw error;
    }
  }

  /**
   * Validate idempotency key format
   */
  private isValidIdempotencyKey(key: string): boolean {
    // Should be UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(key);
  }

  /**
   * Get retry count for key
   */
  private async getRetryCount(key: string): Promise<number> {
    const record = await prisma.idempotencyRetry.findUnique({
      where: { key },
    });
    return record?.count || 0;
  }

  /**
   * Increment retry count
   */
  private async incrementRetryCount(key: string): Promise<void> {
    await prisma.idempotencyRetry.upsert({
      where: { key },
      update: { count: { increment: 1 } },
      create: { key, count: 1 },
    });
  }

  /**
   * Cache successful response
   */
  private async cacheResponse(key: string, response: NextResponse): Promise<void> {
    const responseBody = await response.text();
    const responseHeaders = Object.fromEntries(response.headers.entries());

    await prisma.idempotencyKey.create({
      data: {
        key,
        responseBody,
        responseHeaders,
        statusCode: response.status,
      },
    });
  }

  /**
   * Log failed attempt
   */
  private async logFailedAttempt(key: string, error: any): Promise<void> {
    // Could log to audit service
    console.error(`Idempotency key ${key} failed:`, error);
  }
}

// Database models needed:
// model IdempotencyKey {
//   id               String   @id @default(uuid())
//   key              String   @unique
//   responseBody     String
//   responseHeaders  Json
//   statusCode       Int
//   createdAt        DateTime @default(now())
//
//   @@map("idempotency_keys")
// }
//
// model IdempotencyRetry {
//   key   String @id
//   count Int    @default(0)
//
//   @@map("idempotency_retries")
// }
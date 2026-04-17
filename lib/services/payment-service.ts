// lib/services/payment-service.ts

export interface PaymentService {
  /**
   * Creates a subscription for an organization or user
   */
  createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult>;

  /**
   * Cancels an existing subscription
   */
  cancelSubscription(subscriptionId: string): Promise<CancelResult>;

  /**
   * Updates a subscription (plan change, etc.)
   */
  updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams): Promise<UpdateResult>;

  /**
   * Creates a payment intent for one-time payments
   */
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult>;

  /**
   * Confirms a payment
   */
  confirmPayment(paymentId: string): Promise<PaymentResult>;

  /**
   * Retries a failed payment with exponential backoff
   */
  retryFailedPayment(paymentId: string): Promise<PaymentResult>;

  /**
   * Adds a payment method for a customer
   */
  addPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult>;

  /**
   * Updates the default payment method for a customer
   */
  updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult>;

  /**
   * Removes a payment method from a customer
   */
  removePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult>;

  /**
   * Retrieves subscription details
   */
  getSubscription(subscriptionId: string): Promise<SubscriptionDetails>;

  /**
   * Lists invoices for a subscription
   */
  listInvoices(subscriptionId: string): Promise<Invoice[]>;

  /**
   * Handles webhook events
   */
  handleWebhook(payload: any, signature: string): Promise<WebhookResult>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionResult {
  subscriptionId: string;
  clientSecret?: string;
  status: string;
}

export interface CancelResult {
  success: boolean;
  canceledAt?: Date;
}

export interface UpdateSubscriptionParams {
  priceId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateResult {
  success: boolean;
  subscriptionId: string;
}

export interface PaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  amount: number;
}

export interface PaymentMethodResult {
  success: boolean;
  paymentMethodId: string;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate?: Date;
  paidAt?: Date;
}

export interface WebhookResult {
  type: string;
  data: any;
  processed: boolean;
}
// lib/services/razorpay-service.ts

import Razorpay from 'razorpay';
import { PaymentService, CreateSubscriptionParams, SubscriptionResult, CancelResult, UpdateSubscriptionParams, UpdateResult, PaymentIntentParams, PaymentIntentResult, PaymentResult, PaymentMethodResult, SubscriptionDetails, Invoice, WebhookResult } from './payment-service';

export class RazorpayService implements PaymentService {
  private razorpay: Razorpay;

  constructor(keyId: string, keySecret: string) {
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: params.priceId,
        customer_notify: 1, // Notify customer
        total_count: 12, // Default to 12 months, can be adjusted
        quantity: 1,
        start_at: Math.floor(Date.now() / 1000),
        notes: params.metadata,
      });

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
      };
    } catch (error) {
      throw new Error(`Razorpay subscription creation failed: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<CancelResult> {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId);

      return {
        success: true,
        canceledAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Razorpay subscription cancellation failed: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
    }
  }

  async updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams): Promise<UpdateResult> {
    try {
      const updateData: any = {};
      if (params.priceId) {
        updateData.plan_id = params.priceId;
      }
      if (params.metadata) {
        updateData.notes = params.metadata;
      }

      const subscription = await this.razorpay.subscriptions.update(subscriptionId, updateData);

      return {
        success: true,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      throw new Error(`Razorpay subscription update failed: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
    }
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(params.amount * 100), // Convert to paisa
        currency: params.currency.toUpperCase(),
        notes: params.metadata,
      });

      return {
        clientSecret: order.id, // Razorpay uses order ID as client secret equivalent
        paymentIntentId: order.id,
      };
    } catch (error) {
      throw new Error(`Razorpay order creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        success: payment.status === 'captured',
        paymentId: payment.id,
        amount: Number(payment.amount) / 100, // Convert from paisa
      };
    } catch (error) {
      throw new Error(`Razorpay payment confirmation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async retryFailedPayment(paymentId: string): Promise<PaymentResult> {
    try {
      // For Razorpay, retrying a failed payment by creating a new order or updating
      // This is simplified; in practice, you might need to handle specific failure reasons
      const payment = await this.razorpay.payments.fetch(paymentId);

      if (payment.status === 'failed') {
        // Attempt to recapture or create new payment link
        // For simplicity, return current status
        return {
          success: false,
          paymentId: payment.id,
        amount: Number(payment.amount) / 100,
        };
      }

      return {
        success: payment.status === 'captured',
        paymentId: payment.id,
        amount: Number(payment.amount) / 100,
      };
    } catch (error) {
      throw new Error(`Razorpay payment retry failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async addPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult> {
    try {
      // Razorpay handles payment methods differently; this is a placeholder
      // In practice, you might store tokenized payment methods
      console.log(`Adding payment method ${paymentMethodId} for customer ${customerId}`);

      return {
        success: true,
        paymentMethodId,
      };
    } catch (error) {
      throw new Error(`Razorpay payment method attachment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult> {
    try {
      // Razorpay doesn't have direct payment method management like Stripe
      // This would typically involve updating customer preferences
      console.log(`Updating payment method ${paymentMethodId} for customer ${customerId}`);

      return {
        success: true,
        paymentMethodId,
      };
    } catch (error) {
      throw new Error(`Razorpay payment method update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async removePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult> {
    try {
      // Razorpay payment method removal
      console.log(`Removing payment method ${paymentMethodId} for customer ${customerId}`);

      return {
        success: true,
        paymentMethodId,
      };
    } catch (error) {
      throw new Error(`Razorpay payment method removal failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);

      // Fetch plan details
      const plan = await this.razorpay.plans.fetch(subscription.plan_id);

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_start ? new Date(subscription.current_start * 1000) : new Date(),
        currentPeriodEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : new Date(),
        plan: {
          id: plan.id,
          name: plan.item.name,
          price: Number(plan.item.amount) / 100,
        },
      };
    } catch (error) {
      throw new Error(`Razorpay subscription retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listInvoices(subscriptionId: string): Promise<Invoice[]> {
    try {
      // Razorpay doesn't have direct invoices, but we can get subscription details
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);

      // For simplicity, return a mock invoice based on subscription
      // In real implementation, you might need to track invoices separately
      return [{
        id: subscription.id,
        amount: 0, // Would need to get from plan
        status: subscription.status === 'active' ? 'paid' : 'open',
        dueDate: subscription.current_end ? new Date(subscription.current_end * 1000) : undefined,
      }];
    } catch (error) {
      throw new Error(`Razorpay invoices listing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    try {
      // Verify webhook signature
      const expectedSignature = require('crypto')
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const event = payload.event;
      const data = payload.payload;

      const processedData: any = {};

      // Process the event based on type
      switch (event) {
        case 'subscription.charged':
          processedData.subscriptionId = data.subscription.entity.id;
          processedData.status = 'paid';
          processedData.amount = data.payment.entity.amount / 100;
          break;
        case 'subscription.cancelled':
          processedData.subscriptionId = data.subscription.entity.id;
          processedData.status = 'canceled';
          break;
        case 'subscription.updated':
          processedData.subscriptionId = data.subscription.entity.id;
          processedData.status = data.subscription.entity.status;
          processedData.currentPeriodStart = new Date(data.subscription.entity.current_start * 1000);
          processedData.currentPeriodEnd = new Date(data.subscription.entity.current_end * 1000);
          break;
        case 'subscription.created':
          processedData.subscriptionId = data.subscription.entity.id;
          processedData.status = data.subscription.entity.status;
          break;
        case 'payment.failed':
          processedData.subscriptionId = data.subscription?.entity?.id;
          processedData.status = 'past_due';
          break;
        default:
          console.log(`Unhandled event type ${event}`);
      }

      return {
        type: event,
        data: processedData,
        processed: true,
      };
    } catch (error) {
      throw new Error(`Razorpay webhook handling failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
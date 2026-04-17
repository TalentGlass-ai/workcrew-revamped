// lib/services/razorpay-service.ts

import Razorpay from 'razorpay';
import { PaymentService, CreateSubscriptionParams, SubscriptionResult, CancelResult, UpdateSubscriptionParams, UpdateResult, PaymentIntentParams, PaymentIntentResult, PaymentResult, SubscriptionDetails, Invoice, WebhookResult } from './payment-service';

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
        customer_id: params.customerId,
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
      throw new Error(`Razorpay subscription creation failed: ${error.message}`);
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
      throw new Error(`Razorpay subscription cancellation failed: ${error.message}`);
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
      throw new Error(`Razorpay subscription update failed: ${error.message}`);
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
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        success: payment.status === 'captured',
        paymentId: payment.id,
        amount: payment.amount / 100, // Convert from paisa
      };
    } catch (error) {
      throw new Error(`Razorpay payment confirmation failed: ${error.message}`);
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
        currentPeriodStart: new Date(subscription.current_start * 1000),
        currentPeriodEnd: new Date(subscription.current_end * 1000),
        plan: {
          id: plan.id,
          name: plan.item.name,
          price: plan.item.amount / 100,
        },
      };
    } catch (error) {
      throw new Error(`Razorpay subscription retrieval failed: ${error.message}`);
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
        amount: subscription.plan.item.amount / 100,
        status: subscription.status === 'active' ? 'paid' : 'open',
        dueDate: new Date(subscription.current_end * 1000),
      }];
    } catch (error) {
      throw new Error(`Razorpay invoices listing failed: ${error.message}`);
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

      // Process the event based on type
      switch (event) {
        case 'subscription.charged':
          // Handle successful charge
          break;
        case 'subscription.cancelled':
          // Handle subscription cancellation
          break;
        default:
          console.log(`Unhandled event type ${event}`);
      }

      return {
        type: event,
        data: data,
        processed: true,
      };
    } catch (error) {
      throw new Error(`Razorpay webhook handling failed: ${error.message}`);
    }
  }
}
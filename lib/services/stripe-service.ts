// lib/services/stripe-service.ts

import Stripe from 'stripe';
import { PaymentService, CreateSubscriptionParams, SubscriptionResult, CancelResult, UpdateSubscriptionParams, UpdateResult, PaymentIntentParams, PaymentIntentResult, PaymentResult, SubscriptionDetails, Invoice, WebhookResult } from './payment-service';

export class StripeService implements PaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-06-20',
    });
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: params.customerId,
        items: [{
          price: params.priceId,
        }],
        metadata: params.metadata,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status,
      };
    } catch (error) {
      throw new Error(`Stripe subscription creation failed: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<CancelResult> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        success: true,
        canceledAt: new Date(subscription.cancel_at * 1000),
      };
    } catch (error) {
      throw new Error(`Stripe subscription cancellation failed: ${error.message}`);
    }
  }

  async updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams): Promise<UpdateResult> {
    try {
      const updateData: any = {};
      if (params.priceId) {
        updateData.items = [{
          id: (await this.stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
          price: params.priceId,
        }];
      }
      if (params.metadata) {
        updateData.metadata = params.metadata;
      }

      const subscription = await this.stripe.subscriptions.update(subscriptionId, updateData);

      return {
        success: true,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      throw new Error(`Stripe subscription update failed: ${error.message}`);
    }
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        metadata: params.metadata,
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
      };
    } catch (error) {
      throw new Error(`Stripe payment confirmation failed: ${error.message}`);
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });

      const price = subscription.items.data[0].price;

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan: {
          id: price.id,
          name: price.nickname || 'Unnamed Plan',
          price: price.unit_amount! / 100,
        },
      };
    } catch (error) {
      throw new Error(`Stripe subscription retrieval failed: ${error.message}`);
    }
  }

  async listInvoices(subscriptionId: string): Promise<Invoice[]> {
    try {
      const invoices = await this.stripe.invoices.list({
        subscription: subscriptionId,
      });

      return invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_due / 100,
        status: invoice.status || 'draft',
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined,
      }));
    } catch (error) {
      throw new Error(`Stripe invoices listing failed: ${error.message}`);
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);

      // Process the event based on type
      switch (event.type) {
        case 'invoice.payment_succeeded':
          // Handle successful payment
          break;
        case 'customer.subscription.updated':
          // Handle subscription update
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return {
        type: event.type,
        data: event.data.object,
        processed: true,
      };
    } catch (error) {
      throw new Error(`Stripe webhook handling failed: ${error.message}`);
    }
  }
}
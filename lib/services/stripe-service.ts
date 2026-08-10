// lib/services/stripe-service.ts

import Stripe from 'stripe';
import { PaymentService, CreateSubscriptionParams, SubscriptionResult, CancelResult, UpdateSubscriptionParams, UpdateResult, PaymentIntentParams, PaymentIntentResult, PaymentResult, PaymentMethodResult, SubscriptionDetails, Invoice, WebhookResult } from './payment-service';

export class StripeService implements PaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey);
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
      throw new Error(`Stripe subscription creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<CancelResult> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        success: true,
        canceledAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined,
      };
    } catch (error) {
      throw new Error(`Stripe subscription cancellation failed: ${error instanceof Error ? error.message : String(error)}`);
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
      throw new Error(`Stripe subscription update failed: ${error instanceof Error ? error.message : String(error)}`);
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
      throw new Error(`Stripe payment intent creation failed: ${error instanceof Error ? error.message : String(error)}`);
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
      throw new Error(`Stripe payment confirmation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async retryFailedPayment(paymentId: string): Promise<PaymentResult> {
    try {
      // For Stripe, retrying a failed payment intent
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentId);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      };
    } catch (error) {
      throw new Error(`Stripe payment retry failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async addPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult> {
    try {
      const pm = await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      return {
        success: true,
        paymentMethodId,
        type: pm.type,
        last4: pm.card?.last4 ?? null,
        brand: pm.card?.brand ?? null,
        expiryMonth: pm.card?.exp_month ?? null,
        expiryYear: pm.card?.exp_year ?? null,
      };
    } catch (error) {
      throw new Error(`Stripe payment method attachment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult> {
    try {
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return {
        success: true,
        paymentMethodId,
      };
    } catch (error) {
      throw new Error(`Stripe payment method update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async removePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResult> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);

      return {
        success: true,
        paymentMethodId,
      };
    } catch (error) {
      throw new Error(`Stripe payment method removal failed: ${error instanceof Error ? error.message : String(error)}`);
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
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        plan: {
          id: price.id,
          name: price.nickname || 'Unnamed Plan',
          price: price.unit_amount! / 100,
        },
      };
    } catch (error) {
      throw new Error(`Stripe subscription retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
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
      throw new Error(`Stripe invoices listing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleWebhook(rawBody: string, signature: string): Promise<WebhookResult> {
    try {
      // constructEvent requires the raw body string, not parsed JSON
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
      return {
        id: event.id,
        type: event.type,
        data: event.data.object, // raw Stripe object — route handlers use Stripe field names directly
        processed: true,
      };
    } catch (error) {
      throw new Error(`Stripe webhook handling failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
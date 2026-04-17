# Phase 3: Billing & Subscription System

## Phase Goal
Implement a production-grade subscription management and payment system for WorkCrew.ai with region-aware payment processing, usage-based billing, and intelligent monetization features.

## Success Criteria
- [ ] Region-aware payment routing (Stripe global, Razorpay India)
- [ ] Organization-based SaaS subscriptions with 4 tiers
- [ ] Usage-based billing with automatic metering
- [ ] Premium candidate features and subscriptions
- [ ] Webhook handling for payment events
- [ ] Billing dashboard with usage tracking
- [ ] Upgrade recommendation system
- [ ] Production-ready security and error handling

## Technical Requirements

### Payment Gateway Architecture
- Abstract `PaymentService` interface
- `StripeService` for global payments
- `RazorpayService` for Indian payments
- Auto region detection (IP-based + profile-based)

### Database Schema Additions
- `Subscription` model with plan management
- `Plan` model with pricing tiers
- `Usage` model for metered billing
- `Invoice` and `Payment` models
- `OrganizationBilling` for multi-tenant billing

### API Endpoints
- `POST /api/billing/subscribe` - Create subscription
- `POST /api/billing/upgrade` - Change plans
- `POST /api/billing/cancel` - Cancel subscription
- `GET /api/billing/status` - Get billing info
- `GET /api/billing/usage` - Get usage metrics
- `POST /api/webhooks/stripe` - Stripe webhooks
- `POST /api/webhooks/razorpay` - Razorpay webhooks

### Subscription Plans

#### Organization Plans
- **FREE**: 1 job, limited visibility, basic analytics
- **GROWTH**: 10 jobs, AI matching, limited screening
- **PRO**: Unlimited jobs, full AI features, priority listing
- **ENTERPRISE**: Custom pricing, API access, dedicated support

#### Candidate Plans
- **FREE**: Basic profile, limited recommendations
- **PRO**: AI insights, profile boost, advanced analytics

### Usage-Based Features
- Job postings (monthly limits)
- Candidate unlocks (pay-per-view)
- AI interview sessions (credits)
- Video screenings (credits)

## Implementation Plan

### Wave 1: Core Infrastructure
1. **Prisma Schema Updates**
   - Add billing-related models
   - Update existing models for billing integration
   - Create database migrations

2. **Payment Service Abstraction**
   - Create `PaymentService` interface
   - Implement `StripeService` class
   - Implement `RazorpayService` class
   - Add region detection logic

### Wave 2: Subscription Management
3. **Subscription Logic**
   - Plan management system
   - Subscription lifecycle (create, update, cancel)
   - Proration calculations
   - Plan upgrade/downgrade logic

4. **Usage Tracking**
   - Usage middleware for API calls
   - Monthly usage reset logic
   - Overage billing automation
   - Usage analytics

### Wave 3: Payment Processing
5. **Payment Integration**
   - Stripe payment intents
   - Razorpay order creation
   - Payment confirmation handling
   - Failed payment retry logic

6. **Webhook Handlers**
   - Stripe webhook signature verification
   - Razorpay webhook processing
   - Payment status updates
   - Subscription event handling

### Wave 4: User Experience
7. **Billing Dashboard**
   - Current plan display
   - Usage meters and progress bars
   - Billing history
   - Upgrade prompts

8. **Pricing Pages**
   - SEO-optimized pricing page
   - Region-specific pricing (/pricing/india, /pricing/global)
   - Plan comparison tables
   - CTA optimization

### Wave 5: Intelligence & Optimization
9. **Billing Intelligence**
   - Upgrade suggestion algorithms
   - Usage threshold alerts
   - Revenue optimization logic
   - A/B testing for pricing

10. **Security & Compliance**
    - Webhook signature verification
    - Idempotency key handling
    - PCI compliance considerations
    - Error handling and logging

## Dependencies
- Prisma schema updates (Wave 1)
- Payment gateway accounts (Stripe + Razorpay)
- Environment variables for API keys
- Database migration strategy

## Testing Strategy
- Unit tests for payment services
- Integration tests for subscription flows
- Webhook signature verification tests
- Usage tracking accuracy tests
- End-to-end payment flow tests

## Rollout Plan
1. **Development**: Implement all features with test coverage
2. **Staging**: Full integration testing with payment gateways
3. **Production**: Gradual rollout with feature flags
4. **Monitoring**: Revenue tracking and error monitoring

## Risk Mitigation
- Payment gateway redundancy
- Database transaction safety
- Webhook retry mechanisms
- Customer support escalation paths
- Regulatory compliance (GDPR, PCI)

## Success Metrics
- Payment success rate > 95%
- Subscription conversion rate
- Customer churn reduction
- Revenue per user growth
- Support ticket reduction
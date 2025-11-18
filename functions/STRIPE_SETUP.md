# Stripe Integration Setup Guide

This guide will help you set up the required Stripe secrets and parameters for your Firebase Functions.

## Required Values

You'll need the following from your Stripe Dashboard:

1. **Stripe Secret Key**: Found in Stripe Dashboard → Developers → API keys
   - Format: `sk_live_...` (production) or `sk_test_...` (testing)

2. **Stripe Webhook Secret**: Found after creating a webhook endpoint
   - Format: `whsec_...`
   - Create a webhook endpoint pointing to: `https://us-central1-pickit-b12e5.cloudfunctions.net/stripeWebhook`

3. **Stripe Price ID**: Found in Stripe Dashboard → Products → Your Product → Pricing
   - Format: `price_...`

## Setup Steps

### Option 1: Interactive Setup Script

Run the provided setup script:

```bash
cd functions
./setup-secrets.sh
```

This will prompt you for each value and set them up automatically.

### Option 2: Manual Setup

#### 1. Set Stripe Secret Key (Secret)

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# When prompted, paste your Stripe Secret Key
```

#### 2. Set Stripe Webhook Secret (Secret)

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# When prompted, paste your Stripe Webhook Secret
```

#### 3. Set Stripe Price ID (String Parameter)

For the price ID, you have two options:

**Option A: Set as environment variable during deploy**
```bash
export STRIPE_PREMIUM_PRICE_ID="price_xxxxx"
firebase deploy --only functions
```

**Option B: Set in Firebase Console**
1. Go to Firebase Console → Functions → Configuration
2. Add environment variable: `STRIPE_PREMIUM_PRICE_ID` = `price_xxxxx`

**Option C: Update firebase.json** (if supported)
Add the value directly in `firebase.json` under the functions params section.

## Verify Setup

After setting up, verify your secrets are configured:

```bash
# Check if secrets exist (won't show values for security)
firebase functions:secrets:list

# Test accessing a secret (will prompt for confirmation)
firebase functions:secrets:access STRIPE_SECRET_KEY
```

## Deploy

Once all secrets and parameters are set, deploy your functions:

```bash
firebase deploy --only functions
```

## Troubleshooting

- **Error: Secret not found**: Make sure you've run `firebase functions:secrets:set` for each secret
- **Error: Parameter not configured**: Make sure `STRIPE_PREMIUM_PRICE_ID` is set as an environment variable or in Firebase Console
- **Webhook verification fails**: Double-check your webhook secret matches what's configured in Stripe Dashboard

## Security Notes

- Never commit secrets to version control
- Secrets are automatically encrypted by Firebase
- The `STRIPE_PREMIUM_PRICE_ID` is a public parameter (not a secret) since it's just a price identifier



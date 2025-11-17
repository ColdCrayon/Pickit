#!/bin/bash
# Setup script for Firebase Functions secrets
# Run this script and provide your Stripe keys when prompted

echo "Setting up Firebase Functions secrets for Stripe integration..."
echo ""
echo "You'll need:"
echo "  1. Your Stripe Secret Key (starts with sk_live_ or sk_test_)"
echo "  2. Your Stripe Webhook Secret (starts with whsec_)"
echo "  3. Your Stripe Price ID (starts with price_)"
echo ""

# Set Stripe Secret Key
echo "Setting STRIPE_SECRET_KEY..."
echo "Enter your Stripe Secret Key:"
firebase functions:secrets:set STRIPE_SECRET_KEY

# Set Stripe Webhook Secret
echo ""
echo "Setting STRIPE_WEBHOOK_SECRET..."
echo "Enter your Stripe Webhook Secret:"
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# Set Stripe Price ID (this is a string parameter, not a secret)
echo ""
echo "Setting STRIPE_PREMIUM_PRICE_ID..."
echo "Enter your Stripe Price ID (starts with price_):"
read -r PRICE_ID

# Create a .env.local file for local development
echo "STRIPE_PREMIUM_PRICE_ID=$PRICE_ID" > .env.local
echo "✅ Created .env.local with price ID"

echo ""
echo "⚠️  IMPORTANT: For deployment, you need to set STRIPE_PREMIUM_PRICE_ID as an environment variable:"
echo "   Option 1: Set it when deploying:"
echo "     export STRIPE_PREMIUM_PRICE_ID=\"$PRICE_ID\""
echo "     firebase deploy --only functions"
echo ""
echo "   Option 2: Set it in Firebase Console:"
echo "     Go to Firebase Console → Functions → Configuration → Environment Variables"
echo "     Add: STRIPE_PREMIUM_PRICE_ID = $PRICE_ID"

echo ""
echo "✅ Secrets configured! You can now deploy your functions."
echo ""
echo "To verify, run:"
echo "  firebase functions:secrets:access STRIPE_SECRET_KEY"
echo "  firebase functions:config:get"


#!/bin/bash

# MaxScore Deployment Guide
# Interactive guide to deploy your app

echo "
╔══════════════════════════════════════════════════════════════╗
║           MaxScore Deployment Guide (5 minutes)              ║
╚══════════════════════════════════════════════════════════════╝
"

echo "This guide will help you deploy MaxScore to production."
echo "You'll need to create accounts on a few free services."
echo ""

# Step 1: Vercel
echo "═══════════════════════════════════════════════════════════"
echo "STEP 1: Deploy Frontend to Vercel (FREE)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://vercel.com/new"
echo "2. Sign in with GitHub"
echo "3. Import your maxscore repository"
echo "4. Set root directory to: apps/web"
echo "5. Add these environment variables:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo "   - NEXT_PUBLIC_APP_URL (your vercel URL)"
echo ""
echo "Press Enter when done..."
read

# Step 2: Neon Database
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "STEP 2: Create Database on Neon (FREE)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://neon.tech"
echo "2. Sign up (use GitHub)"
echo "3. Create a new project called 'maxscore'"
echo "4. Copy the connection string (DATABASE_URL)"
echo ""
echo "Your DATABASE_URL will look like:"
echo "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/maxscore"
echo ""
echo "Press Enter when done..."
read

# Step 3: Clerk Auth
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "STEP 3: Setup Authentication with Clerk (FREE)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://clerk.com"
echo "2. Sign up and create a new application"
echo "3. Choose 'Google' as sign-in method"
echo "4. Copy these keys:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (starts with pk_)"
echo "   - CLERK_SECRET_KEY (starts with sk_)"
echo ""
echo "Press Enter when done..."
read

# Step 4: Railway Backend
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "STEP 4: Deploy Backend to Railway (FREE \$5/month credit)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://railway.app"
echo "2. Sign in with GitHub"
echo "3. New Project → Deploy from GitHub repo"
echo "4. Select maxscore repo, set root to: apps/api"
echo "5. Add a Redis service (click + Add → Redis)"
echo "6. Add environment variables from your .env"
echo ""
echo "Press Enter when done..."
read

# Step 5: Anthropic API
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "STEP 5: Get Claude API Key (Pay-as-you-go)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://console.anthropic.com"
echo "2. Sign up and add payment method"
echo "3. Go to API Keys → Create Key"
echo "4. Copy ANTHROPIC_API_KEY"
echo ""
echo "Cost: ~\$0.003 per analysis (very cheap!)"
echo ""
echo "Press Enter when done..."
read

# Step 6: Stripe (Optional)
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "STEP 6: Setup Payments with Stripe (Optional)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://dashboard.stripe.com"
echo "2. Sign up for an account"
echo "3. Get your API keys from Developers → API keys"
echo "4. Create a Product with \$9.99/month price"
echo ""
echo "You can skip this for now and add payments later."
echo ""
echo "Press Enter to finish..."
read

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
║                    🎉 Setup Complete!                         ║
╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Your MaxScore app should now be live at your Vercel URL!"
echo ""
echo "Environment variables to set in Vercel & Railway:"
echo "─────────────────────────────────────────────────"
echo "DATABASE_URL=<from Neon>"
echo "REDIS_URL=<from Railway Redis>"
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from Clerk>"
echo "CLERK_SECRET_KEY=<from Clerk>"
echo "ANTHROPIC_API_KEY=<from Anthropic>"
echo "STRIPE_SECRET_KEY=<from Stripe (optional)>"
echo ""
echo "Total cost: \$0-5/month for low traffic"
echo ""

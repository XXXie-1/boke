#!/bin/bash

# Deployment helper script for Vercel + Supabase

set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    exit 1
fi

echo "✅ Environment variables check passed"

# Run tests
echo "🧪 Running tests..."
npm run test

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run type checking
echo "📝 Running type checking..."
npm run type-check

# Build the project
echo "🏗️ Building project..."
npm run build

echo "✅ Build completed successfully"

# Deploy database migrations if in production
if [ "$NODE_ENV" = "production" ]; then
    echo "🗄️ Deploying database migrations..."
    npm run db:migrate:deploy
    echo "✅ Database migrations completed"
fi

# Deploy edge functions if they exist
if [ -d "supabase/functions" ]; then
    echo "⚡ Deploying edge functions..."
    supabase functions deploy
    echo "✅ Edge functions deployed"
fi

echo "🎉 Deployment completed successfully!"
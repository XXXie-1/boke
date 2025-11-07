#!/bin/bash

echo "🔍 Verifying Vercel + Supabase Starter Kit Setup..."
echo ""

# Check essential files
echo "📁 Checking essential files..."
essential_files=(
    "package.json"
    "tsconfig.json"
    "next.config.js"
    "tailwind.config.js"
    "postcss.config.js"
    ".env.example"
    ".gitignore"
    ".eslintrc.json"
    "jest.config.js"
    "vercel.json"
    "README.md"
    "DEPLOYMENT_CHECKLIST.md"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Missing!"
    fi
done

echo ""
echo "📂 Checking directory structure..."

# Check directories
directories=(
    "src"
    "src/lib"
    "src/pages"
    "src/pages/api"
    "src/pages/api/auth"
    "src/app"
    "src/app/api"
    "src/types"
    "supabase"
    "supabase/migrations"
    "supabase/functions"
    ".github/workflows"
    "__tests__"
    "scripts"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/ - Missing!"
    fi
done

echo ""
echo "🔍 Checking key application files..."

app_files=(
    "src/pages/index.tsx"
    "src/pages/auth/login.tsx"
    "src/pages/auth/signup.tsx"
    "src/pages/api/auth/login.ts"
    "src/pages/api/auth/signup.ts"
    "src/pages/api/auth/logout.ts"
    "src/pages/api/health.ts"
    "src/app/layout.tsx"
    "src/app/page.tsx"
    "src/app/api/health/route.ts"
    "src/middleware.ts"
    "src/lib/supabase.ts"
    "src/types/database.ts"
    "supabase/config.toml"
    "supabase/migrations/20240101000000_create_profiles.sql"
    ".github/workflows/ci.yml"
    "scripts/deploy.sh"
)

for file in "${app_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Missing!"
    fi
done

echo ""
echo "📋 Checking package.json scripts..."

# Check if essential scripts exist in package.json
if grep -q '"dev"' package.json; then
    echo "✅ dev script"
else
    echo "❌ dev script missing"
fi

if grep -q '"build"' package.json; then
    echo "✅ build script"
else
    echo "❌ build script missing"
fi

if grep -q '"test"' package.json; then
    echo "✅ test script"
else
    echo "❌ test script missing"
fi

if grep -q '"lint"' package.json; then
    echo "✅ lint script"
else
    echo "❌ lint script missing"
fi

if grep -q '"db:migrate"' package.json; then
    echo "✅ db:migrate script"
else
    echo "❌ db:migrate script missing"
fi

echo ""
echo "🎯 Checking environment variables template..."

if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.example; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL documented"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL missing from .env.example"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.example; then
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY documented"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY missing from .env.example"
fi

echo ""
echo "🚀 Checking deployment configuration..."

if grep -q "NEXT_PUBLIC_SUPABASE_URL" vercel.json; then
    echo "✅ Vercel environment variables configured"
else
    echo "❌ Vercel environment variables not configured"
fi

if [ -f ".github/workflows/ci.yml" ]; then
    echo "✅ GitHub Actions workflow configured"
else
    echo "❌ GitHub Actions workflow missing"
fi

echo ""
echo "📚 Checking documentation..."

if [ -f "README.md" ]; then
    echo "✅ README.md exists"
    if grep -q "## Quick Start" README.md; then
        echo "✅ README contains quick start guide"
    else
        echo "❌ README missing quick start guide"
    fi
else
    echo "❌ README.md missing"
fi

if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    echo "✅ Deployment checklist exists"
else
    echo "❌ Deployment checklist missing"
fi

echo ""
echo "🎉 Verification complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Copy '.env.example' to '.env.local' and fill in your Supabase credentials"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Set up your Supabase project and run migrations"
echo "5. Deploy to Vercel when ready!"
echo ""
echo "📖 For detailed instructions, see README.md"
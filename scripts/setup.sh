#!/bin/bash

# MaxScore Quick Setup Script
# This script helps automate the setup process

set -e

echo "🚀 MaxScore Setup Script"
echo "========================"
echo ""

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
    echo "✅ $1 found"
}

echo "Checking required tools..."
check_tool "node"
check_tool "pnpm"
check_tool "python3"

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🐍 Setting up Python environment..."
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

echo ""
echo "✅ Local setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and fill in your API keys"
echo "2. Run 'pnpm dev:web' to start the frontend"
echo "3. Run 'pnpm dev:api' to start the backend"
echo ""
echo "For deployment, run: ./scripts/deploy-guide.sh"

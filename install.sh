#!/bin/bash

# Fax-lang Installation Script
set -e

echo "🦊 Installing Fax-lang..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

# Check for LLVM (llc)
if ! command -v llc &> /dev/null && ! command -v llc-18 &> /dev/null && ! command -v llc-14 &> /dev/null; then
    echo "Warning: LLVM (llc) not found. You can still compile to IR, but not to binary."
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build the project
echo "🏗️ Building Fax-lang..."
npm run build

# Make binary executable
chmod +x dist/index.js

echo ""
echo "✅ Installation Complete!"
echo "You can now run Fax-lang using: node dist/index.js build <file.fx>"
echo "Or use 'sudo make install' to install it system-wide as 'fax'."

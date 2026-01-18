#!/bin/bash

# Fax-lang Advanced Installer
# Modern UX for Systems Programming

set -e

# --- Colors & Styles ---
ORANGE='\033[38;5;208m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Icons ---
CHECK="\xE2\x9C\xA8"
WARN="\xE2\x9A\xA0"
ERROR="\xE2\x9A\xA0"
INFO="\xE2\x91\xA0"
FOX="\xF0\x9F\xA7\x80"

# --- Helper Functions ---
log_info() { echo -e "${BLUE}${INFO} ${NC}$1"; }
log_success() { echo -e "${GREEN}${CHECK} ${BOLD}$1${NC}"; }
log_warn() { echo -e "${YELLOW}${WARN} $1${NC}"; }
log_error() { echo -e "${RED}${ERROR} ${BOLD}$1${NC}"; }

print_banner() {
    echo -e "${ORANGE}"
    echo "      /\__"
    echo "     (    @\___"
    echo "     /         O    ${BOLD}Fax-lang${NC}${ORANGE}"
    echo "    /   (_____/     ${NC}${BLUE}The Future of Memory Safety${NC}${ORANGE}"
    echo "   /_____/   U"
    echo -e "${NC}"
}

# --- 1. Start Installation ---
clear
print_banner
echo -e "${BOLD}Starting sophisticated installation process...${NC}\n"

# --- 2. System Requirements Check ---
echo -e "${BOLD}[1/4] Checking System Requirements...${NC}"

# Node.js Check
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js v18 or newer."
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    log_warn "Node.js version $NODE_VER detected. v18+ is recommended."
else
    log_success "Node.js $(node -v) detected."
fi

# LLVM Check
log_info "Searching for LLVM backend (llc)..."
LLC_BIN=""
for bin in llc llc-18 llc-17 llc-16 llc-15 llc-14; do
    if command -v $bin &> /dev/null; then
        LLC_BIN=$bin
        break
    fi
done

if [ -z "$LLC_BIN" ]; then
    log_warn "LLVM 'llc' not found. You can compile to .ll files, but not to native binaries."
else
    log_success "LLVM backend found: $LLC_BIN"
fi

# --- 3. Dependency Installation ---
echo -e "\n${BOLD}[2/4] Initializing Environment...${NC}"
log_info "Installing npm dependencies (clean install)..."

if npm install --quiet; then
    log_success "Dependencies synchronized successfully."
else
    log_error "Failed to install dependencies. Check your internet connection or npm permissions."
    exit 1
fi

# --- 4. Building Compiler ---
echo -e "\n${BOLD}[3/4] Building Fax-lang Compiler...${NC}"
log_info "Compiling TypeScript source to optimized JavaScript..."

if npm run build --quiet; then
    log_success "Compiler build successful."
else
    log_error "Build failed. Check for TypeScript syntax errors."
    exit 1
fi

# Ensure executable permissions
chmod +x dist/index.js

# --- 5. Finalizing ---
echo -e "\n${BOLD}[4/4] Finalizing Installation...${NC}"

# Create a local symlink suggestion
LOCAL_BIN="$HOME/.local/bin"
mkdir -p "$LOCAL_BIN"

log_info "Configuration complete."

echo -e "\n-----------------------------------------------------"
log_success "Fax-lang is now ready to use! ${FOX}"
echo -e "-----------------------------------------------------"
echo -e "${BOLD}Quick Start:${NC}"
echo -e "  1. Compile code:  ${BLUE}./dist/index.js build examples/mvp.fx${NC}"
echo -e "  2. Run binary:    ${BLUE}./examples/mvp${NC}"
echo -e "\n${BOLD}Pro Tip:${NC}"
echo -e "  Add this to your .bashrc or .zshrc:"
echo -e "  ${YELLOW}alias fax='$(pwd)/dist/index.js'${NC}"
echo -e "-----------------------------------------------------\\n"
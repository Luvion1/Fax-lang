#!/bin/bash

# Deployment script for Fax-lang compiler

set -e  # Exit on any error

# Configuration
REPO_NAME="fax-lang"
BUILD_DIR="./build"
DIST_DIR="./dist"
VERSION=$(git describe --tags --always --dirty)

echo "Starting deployment for version: $VERSION"

# Create distribution directory
mkdir -p $DIST_DIR

# Build the project
echo "Building the project..."
node build.js build-all

# Package binaries
echo "Packaging binaries..."
mkdir -p $DIST_DIR/$REPO_NAME-$VERSION

# Copy built binaries
if [ -f "./compiler/lexer/target/release/lexer" ]; then
    cp ./compiler/lexer/target/release/lexer $DIST_DIR/$REPO_NAME-$VERSION/
fi

if [ -f "./compiler/analyzer/target/release/analyzer" ]; then
    cp ./compiler/analyzer/target/release/analyzer $DIST_DIR/$REPO_NAME-$VERSION/
fi

if [ -f "./compiler/checker/checker" ]; then
    cp ./compiler/checker/checker $DIST_DIR/$REPO_NAME-$VERSION/
fi

# Copy source files needed for runtime
cp -r ./compiler/parser/dist $DIST_DIR/$REPO_NAME-$VERSION/
cp ./compiler/transpiler/main.py $DIST_DIR/$REPO_NAME-$VERSION/
cp ./compiler/main.js $DIST_DIR/$REPO_NAME-$VERSION/
cp ./utils/ $DIST_DIR/$REPO_NAME-$VERSION/ --recursive

# Create archives
cd $DIST_DIR
tar -czf $REPO_NAME-$VERSION-linux.tar.gz $REPO_NAME-$VERSION/
zip -r $REPO_NAME-$VERSION-windows.zip $REPO_NAME-$VERSION/

echo "Deployment packages created in $DIST_DIR/"

# Cleanup
cd ..
rm -rf $DIST_DIR/$REPO_NAME-$VERSION

echo "Deployment script completed successfully!"
/**
 * Example plugin for Fax-lang compiler
 * Demonstrates how to create and register a plugin
 */

// Plugin name and version are required
exports.name = 'example-plugin';
exports.version = '1.0.0';
exports.description = 'An example plugin demonstrating plugin functionality';

// Hooks that this plugin registers
exports.hooks = {
  // Called before tokenization
  'before-tokenize': async function(sourceCode) {
    console.log('[Example Plugin] Processing source code before tokenization');
    // Could modify source code here if needed
    return sourceCode;
  },

  // Called after tokenization
  'after-tokenize': async function(tokens) {
    console.log(`[Example Plugin] Tokenized ${tokens.length} tokens`);
    // Could modify tokens here if needed
    return tokens;
  },

  // Called before parsing
  'before-parse': async function(tokens) {
    console.log('[Example Plugin] Processing tokens before parsing');
    return tokens;
  },

  // Called after parsing
  'after-parse': async function(ast) {
    console.log(`[Example Plugin] Parsed AST with ${ast.body.length} statements`);
    // Could modify AST here if needed
    return ast;
  },

  // Called during code generation
  'generate-code': async function(ast) {
    console.log('[Example Plugin] Generating code from AST');
    // Could influence code generation
    return null; // Return null to not override default behavior
  }
};

// Activation function - called when plugin is activated
exports.activate = async function() {
  console.log('[Example Plugin] Activated');
  // Perform any initialization here
};

// Deactivation function - called when plugin is deactivated
exports.deactivate = async function() {
  console.log('[Example Plugin] Deactivated');
  // Perform any cleanup here
};
/**
 * Formatting plugin for Fax-lang compiler
 * Adds automatic formatting functionality to the compilation process
 */

const FaxFormatter = require('../utils/formatter');
const config = require('../config/lint-config.json');

// Plugin name and version are required
exports.name = 'formatting-plugin';
exports.version = '1.0.0';
exports.description = 'A plugin that adds automatic formatting functionality';

// Create formatter instance
const formatter = new FaxFormatter({
  indentSize: config.formatting.indent_size,
  maxLineLength: config.formatting.max_line_length,
  insertFinalNewline: config.formatting.insert_final_newline,
  trimTrailingWhitespace: config.formatting.trim_trailing_whitespace
});

// Hooks that this plugin registers
exports.hooks = {
  // Called before tokenization to format source code
  'before-tokenize': async function(sourceCode) {
    console.log('[Formatting Plugin] Formatting source code...');
    const formattedCode = formatter.format(sourceCode);
    return formattedCode;
  },

  // Called after parsing to format the AST
  'after-parse': async function(ast) {
    console.log('[Formatting Plugin] Formatting AST...');
    // Format the AST according to the style guide
    let formattedOutput = '';
    
    for (const stmt of ast.body) {
      formattedOutput += formatter.formatAstNode(stmt) + '\n';
    }
    
    // For now, we'll just log the formatted output
    // In a real implementation, this could be stored or processed further
    console.log('[Formatting Plugin] AST formatted successfully');
    return ast; // Return the original AST since we're just formatting for display
  }
};

// Activation function - called when plugin is activated
exports.activate = async function() {
  console.log('[Formatting Plugin] Activated');
  // Perform any initialization here
};

// Deactivation function - called when plugin is deactivated
exports.deactivate = async function() {
  console.log('[Formatting Plugin] Deactivated');
  // Perform any cleanup here
};
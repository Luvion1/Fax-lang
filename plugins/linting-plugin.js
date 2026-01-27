/**
 * Linting plugin for Fax-lang compiler
 * Adds linting functionality to the compilation process
 */

// Plugin name and version are required
exports.name = 'linting-plugin';
exports.version = '1.0.0';
exports.description = 'A plugin that adds linting functionality to check code quality';

// Keep track of linting rules
const lintingRules = {
  // Rule to check for unused variables
  checkUnusedVariables: function(ast) {
    const errors = [];
    const usedVars = new Set();
    const declaredVars = new Map();

    // Helper function to collect used variables
    function collectUsedVars(node) {
      if (node.type === 'Identifier') {
        usedVars.add(node.name);
      } else if (node.body && Array.isArray(node.body)) {
        for (const child of node.body) {
          collectUsedVars(child);
        }
      } else if (node.declarations && Array.isArray(node.declarations)) {
        for (const decl of node.declarations) {
          collectUsedVars(decl);
        }
      } else if (node.expressions && Array.isArray(node.expressions)) {
        for (const expr of node.expressions) {
          collectUsedVars(expr);
        }
      } else if (node.left) {
        collectUsedVars(node.left);
      } else if (node.right) {
        collectUsedVars(node.right);
      } else if (node.argument) {
        collectUsedVars(node.argument);
      } else if (node.callee) {
        collectUsedVars(node.callee);
      } else if (node.object) {
        collectUsedVars(node.object);
      } else if (node.property) {
        collectUsedVars(node.property);
      }
    }

    // Helper function to collect declared variables
    function collectDeclaredVars(node) {
      if (node.type === 'VariableDeclaration') {
        declaredVars.set(node.identifier, { line: node.base?.line || 0, col: node.base?.col || 0 });
      } else if (node.body && Array.isArray(node.body)) {
        for (const child of node.body) {
          collectDeclaredVars(child);
        }
      } else if (node.declarations && Array.isArray(node.declarations)) {
        for (const decl of node.declarations) {
          collectDeclaredVars(decl);
        }
      }
    }

    // Collect all used and declared variables
    collectUsedVars(ast);
    collectDeclaredVars(ast);

    // Find unused variables
    for (const [varName, location] of declaredVars) {
      if (!usedVars.has(varName)) {
        errors.push({
          rule: 'no-unused-vars',
          message: `Variable '${varName}' is declared but never used`,
          line: location.line,
          col: location.col
        });
      }
    }

    return errors;
  },

  // Rule to check for complex functions
  checkComplexFunctions: function(ast) {
    const errors = [];
    
    function checkNodeComplexity(node, depth = 0) {
      if (node.type === 'FunctionDeclaration') {
        // Count statements in function body
        const statementCount = node.body ? node.body.length : 0;
        if (statementCount > 10) { // Threshold for complexity
          errors.push({
            rule: 'complex-function',
            message: `Function '${node.name}' has ${statementCount} statements and might be too complex`,
            line: node.base?.line || 0,
            col: node.base?.col || 0
          });
        }
      } else if (node.body && Array.isArray(node.body)) {
        for (const child of node.body) {
          checkNodeComplexity(child, depth + 1);
        }
      }
    }

    checkNodeComplexity(ast);
    return errors;
  }
};

// Hooks that this plugin registers
exports.hooks = {
  // Called after parsing to perform linting
  'after-parse': async function(ast) {
    console.log('[Linting Plugin] Performing code linting...');
    
    // Run all linting rules
    const allErrors = [];
    for (const ruleName in lintingRules) {
      const rule = lintingRules[ruleName];
      try {
        const ruleErrors = rule(ast);
        allErrors.push(...ruleErrors);
      } catch (e) {
        console.error(`[Linting Plugin] Error in rule ${ruleName}:`, e.message);
      }
    }

    // Report errors if any
    if (allErrors.length > 0) {
      console.log(`[Linting Plugin] Found ${allErrors.length} issues:`);
      for (const error of allErrors) {
        console.log(`  Line ${error.line}, Col ${error.col}: ${error.rule} - ${error.message}`);
      }
    } else {
      console.log('[Linting Plugin] No issues found');
    }

    // For now, we don't prevent compilation even if linting errors are found
    // In a real implementation, this could be configurable
    return ast;
  }
};

// Activation function - called when plugin is activated
exports.activate = async function() {
  console.log('[Linting Plugin] Activated');
  // Perform any initialization here
};

// Deactivation function - called when plugin is deactivated
exports.deactivate = async function() {
  console.log('[Linting Plugin] Deactivated');
  // Perform any cleanup here
};
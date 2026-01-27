/**
 * Auto-formatter for Fax-lang source code
 * 
 * This module provides automatic formatting of Fax-lang source code
 * according to the project's style guidelines.
 */

class FaxFormatter {
  constructor(options = {}) {
    this.config = {
      indentSize: options.indentSize || 2,
      maxLineLength: options.maxLineLength || 100,
      insertFinalNewline: options.insertFinalNewline !== false,
      trimTrailingWhitespace: options.trimTrailingWhitespace !== false,
      ...options
    };
  }

  /**
   * Format Fax-lang source code
   */
  format(sourceCode) {
    let lines = sourceCode.split('\n');
    
    // Apply formatting rules
    lines = this.applyIndentation(lines);
    lines = this.applyTrailingSpaceRemoval(lines);
    lines = this.normalizeLineEndings(lines);
    
    // Join lines back together
    let formattedCode = lines.join('\n');
    
    // Add final newline if configured
    if (this.config.insertFinalNewline && !formattedCode.endsWith('\n')) {
      formattedCode += '\n';
    }
    
    return formattedCode;
  }

  /**
   * Apply proper indentation to code
   */
  applyIndentation(lines) {
    const formattedLines = [];
    let currentIndentLevel = 0;
    const indent = ' '.repeat(this.config.indentSize);

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Calculate new indent level based on braces
      const trimmedLine = line.trim();
      
      // Reduce indent if line ends with closing brace
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith(')') || trimmedLine.startsWith(']')) {
        currentIndentLevel = Math.max(0, currentIndentLevel - 1);
      }
      
      // Apply current indent
      const indentedLine = indent.repeat(currentIndentLevel) + trimmedLine;
      formattedLines.push(indentedLine);
      
      // Increase indent if line ends with opening brace
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[')) {
        currentIndentLevel++;
      }
    }
    
    return formattedLines;
  }

  /**
   * Remove trailing whitespace from lines
   */
  applyTrailingSpaceRemoval(lines) {
    if (!this.config.trimTrailingWhitespace) {
      return lines;
    }
    
    return lines.map(line => line.replace(/\s+$/, ''));
  }

  /**
   * Normalize line endings
   */
  normalizeLineEndings(lines) {
    // This is handled implicitly by splitting and joining on '\n'
    return lines;
  }

  /**
   * Format a specific AST node (helper for plugin integration)
   */
  formatAstNode(node, indentLevel = 0) {
    const indent = ' '.repeat(indentLevel * this.config.indentSize);
    
    switch (node.type) {
      case 'VariableDeclaration':
        return `${indent}let ${node.identifier}${node.dataType ? `: ${node.dataType}` : ''} = ${this.formatExpression(node.initializer)};`;
      
      case 'FunctionDeclaration':
        const params = node.parameters.map(p => `${p.name}: ${p.dataType}`).join(', ');
        let result = `${indent}fn ${node.name}(${params})${node.returnType ? ` -> ${node.returnType}` : ''} {\n`;
        
        for (const stmt of node.body) {
          result += this.formatAstNode(stmt, indentLevel + 1) + '\n';
        }
        
        result += `${indent}}`;
        return result;
      
      case 'IfStatement':
        let ifStmt = `${indent}if (${this.formatExpression(node.condition)}) {\n`;
        
        for (const stmt of node.consequent) {
          ifStmt += this.formatAstNode(stmt, indentLevel + 1) + '\n';
        }
        
        ifStmt += `${indent}}`;
        
        if (node.alternate && node.alternate.length > 0) {
          ifStmt += ` else {\n`;
          
          for (const stmt of node.alternate) {
            ifStmt += this.formatAstNode(stmt, indentLevel + 1) + '\n';
          }
          
          ifStmt += `${indent}}`;
        }
        
        return ifStmt;
      
      case 'ReturnStatement':
        return `${indent}return${node.argument ? ` ${this.formatExpression(node.argument)}` : ''};`;
      
      default:
        return `${indent}// Unhandled node type: ${node.type}`;
    }
  }

  /**
   * Format an expression
   */
  formatExpression(expr) {
    switch (expr.type) {
      case 'Literal':
        return typeof expr.value === 'string' ? `"${expr.value}"` : String(expr.value);
      
      case 'Identifier':
        return expr.name;
      
      case 'BinaryExpression':
        return `${this.formatExpression(expr.left)} ${expr.operator} ${this.formatExpression(expr.right)}`;
      
      case 'CallExpression':
        const args = expr.arguments.map(arg => this.formatExpression(arg)).join(', ');
        return `${this.formatExpression(expr.callee)}(${args})`;
      
      default:
        return `/* Unhandled expression type: ${expr.type} */`;
    }
  }
}

module.exports = FaxFormatter;
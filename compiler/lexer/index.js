/**
 * Fax-lang Lexer Module
 * 
 * This module tokenizes source code into a stream of tokens.
 */

const fs = require('fs');
const path = require('path');

// Import token types
const { TokenType } = require('./tokens/types');
const { Keywords } = require('./tokens/keywords');
const { Punctuation } = require('./tokens/punctuation');
const { Operators } = require('./tokens/operator');

// Import utility functions
const { SourceReader } = require('./utils/reader');
const { PositionTracker } = require('./utils/position');

// Import error definitions
const { LexicalError } = require('./errors/lexical-error');

class Lexer {
  constructor(sourceCode) {
    this.reader = new SourceReader(sourceCode);
    this.positionTracker = new PositionTracker();
    this.currentChar = this.reader.getCurrentChar();
    this.tokens = [];
  }

  advance() {
    this.reader.advance();
    this.currentChar = this.reader.getCurrentChar();
    if (this.currentChar === '\n') {
      this.positionTracker.nextLine();
    } else {
      this.positionTracker.incrementColumn();
    }
  }

  peek(lookahead = 1) {
    return this.reader.peek(lookahead);
  }

  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  skipComment() {
    if (this.currentChar === '/' && this.peek() === '/') {
      // Skip single-line comment
      while (this.currentChar && this.currentChar !== '\n') {
        this.advance();
      }
    } else if (this.currentChar === '/' && this.peek() === '*') {
      // Skip multi-line comment
      this.advance(); // skip first '/'
      this.advance(); // skip '*'
      while (this.currentChar) {
        if (this.currentChar === '*' && this.peek() === '/') {
          this.advance(); // skip '*'
          this.advance(); // skip '/'
          break;
        }
        this.advance();
      }
    }
  }

  readNumber() {
    let numStr = '';
    
    // Handle hexadecimal, binary, octal prefixes
    if (this.currentChar === '0' && (this.peek() === 'x' || this.peek() === 'X')) {
      numStr += this.currentChar;
      this.advance();
      numStr += this.currentChar;
      this.advance();
      
      // Read hexadecimal digits
      while (this.currentChar && /[0-9a-fA-F]/.test(this.currentChar)) {
        numStr += this.currentChar;
        this.advance();
      }
    } else if (this.currentChar === '0' && (this.peek() === 'b' || this.peek() === 'B')) {
      numStr += this.currentChar;
      this.advance();
      numStr += this.currentChar;
      this.advance();
      
      // Read binary digits
      while (this.currentChar && /[01]/.test(this.currentChar)) {
        numStr += this.currentChar;
        this.advance();
      }
    } else if (this.currentChar === '0' && /[0-7]/.test(this.peek())) {
      numStr += this.currentChar;
      this.advance();
      
      // Read octal digits
      while (this.currentChar && /[0-7]/.test(this.currentChar)) {
        numStr += this.currentChar;
        this.advance();
      }
    } else {
      // Read decimal number (possibly with decimal point)
      let hasDecimal = false;
      while (this.currentChar && /[0-9.]/.test(this.currentChar)) {
        if (this.currentChar === '.') {
          if (hasDecimal) break; // Second dot starts something else or is an error
          if (!/[0-9]/.test(this.peek())) break; // Dot must be followed by a digit
          hasDecimal = true;
        }
        numStr += this.currentChar;
        this.advance();
      }
    }
    
    // Check if it's a float
    if (numStr.includes('.')) {
      return { type: TokenType.FLOAT_LITERAL, value: parseFloat(numStr) };
    } else {
      // Determine base from prefix
      if (numStr.startsWith('0x') || numStr.startsWith('0X')) {
        return { type: TokenType.HEX_LITERAL, value: parseInt(numStr, 16) };
      } else if (numStr.startsWith('0b') || numStr.startsWith('0B')) {
        return { type: TokenType.BINARY_LITERAL, value: parseInt(numStr, 2) };
      } else if (numStr.startsWith('0') && numStr.length > 1) {
        return { type: TokenType.OCTAL_LITERAL, value: parseInt(numStr, 8) };
      } else {
        return { type: TokenType.INTEGER_LITERAL, value: parseInt(numStr, 10) };
      }
    }
  }

  readString() {
    const quote = this.currentChar;
    let strValue = '';
    this.advance(); // Skip opening quote
    
    while (this.currentChar && this.currentChar !== quote) {
      if (this.currentChar === '\\') {
        this.advance(); // Skip \
        if (!this.currentChar) break;
        
        if (this.currentChar === 'n') strValue += '\n';
        else if (this.currentChar === 't') strValue += '\t';
        else if (this.currentChar === 'r') strValue += '\r';
        else if (this.currentChar === '\\') strValue += '\\';
        else if (this.currentChar === quote) strValue += quote;
        else strValue += this.currentChar;
        
        this.advance();
      } else {
        strValue += this.currentChar;
        this.advance();
      }
    }
    
    if (this.currentChar !== quote) {
      throw new LexicalError(`Unterminated string literal`, this.positionTracker);
    }
    
    this.advance(); // Skip closing quote
    return { type: TokenType.STRING_LITERAL, value: strValue };
  }

  readIdentifier() {
    let idStr = '';
    
    while (this.currentChar && (/[a-zA-Z0-9_]/.test(this.currentChar))) {
      idStr += this.currentChar;
      this.advance();
    }
    
    // Check if it's a keyword
    if (Keywords.hasOwnProperty(idStr)) {
      return { type: Keywords[idStr], value: idStr };
    }
    
    return { type: TokenType.IDENTIFIER, value: idStr };
  }

  tokenize() {
    while (this.currentChar) {
      // Skip whitespace
      this.skipWhitespace();
      
      // Skip comments
      this.skipComment();
      
      // Skip whitespace again after comments
      this.skipWhitespace();
      
      if (!this.currentChar) {
        break;
      }
      
      // Handle single-character tokens
      if (Punctuation.hasOwnProperty(this.currentChar)) {
        this.tokens.push({
          type: Punctuation[this.currentChar],
          value: this.currentChar,
          position: this.positionTracker.getPosition()
        });
        this.advance();
        continue;
      }
      
      // Handle operators
      if (Operators.hasOwnProperty(this.currentChar)) {
        // Check for multi-character operators
        let op = this.currentChar;
        if (this.peek() && Operators.hasOwnProperty(op + this.peek())) {
          op += this.peek();
          if (this.peek(2) && Operators.hasOwnProperty(op + this.peek(2))) {
            op += this.peek(2);
            this.tokens.push({
              type: Operators[op],
              value: op,
              position: this.positionTracker.getPosition()
            });
            this.advance();
            this.advance();
            this.advance();
          } else {
            this.tokens.push({
              type: Operators[op],
              value: op,
              position: this.positionTracker.getPosition()
            });
            this.advance();
            this.advance();
          }
        } else {
          this.tokens.push({
            type: Operators[this.currentChar],
            value: this.currentChar,
            position: this.positionTracker.getPosition()
          });
          this.advance();
        }
        continue;
      }
      
      // Handle numbers
      if (/[0-9]/.test(this.currentChar)) {
        const numToken = this.readNumber();
        numToken.position = this.positionTracker.getPosition();
        this.tokens.push(numToken);
        continue;
      }
      
      // Handle strings
      if (this.currentChar === '"' || this.currentChar === "'") {
        const strToken = this.readString();
        strToken.position = this.positionTracker.getPosition();
        this.tokens.push(strToken);
        continue;
      }
      
      // Handle identifiers and keywords
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        const idToken = this.readIdentifier();
        idToken.position = this.positionTracker.getPosition();
        this.tokens.push(idToken);
        continue;
      }
      
      // Unknown character
      throw new LexicalError(`Unknown character: ${this.currentChar}`, this.positionTracker);
    }
    
    // Add EOF token
    this.tokens.push({
      type: TokenType.EOF,
      value: null,
      position: this.positionTracker.getPosition()
    });
    
    return this.tokens;
  }
}

module.exports = { Lexer };
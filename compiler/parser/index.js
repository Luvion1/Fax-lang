const { TokenType } = require('../lexer/tokens/types');

class ParserError extends Error {
  constructor(message, token) {
    super(message);
    this.name = 'ParserError';
    this.token = token;
    if (token && token.position) {
      this.message = `${message} at line ${token.position.line}, column ${token.position.column} (found '${token.value}')`;
    }
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  advance() {
    const current = this.peek();
    this.position++;
    return current;
  }

  expect(type, message) {
    const token = this.peek();
    if (token && token.type === type) {
      return this.advance();
    }
    throw new ParserError(message || `Expected ${type}`, token);
  }

  match(type) {
    const token = this.peek();
    if (token && token.type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  parse() {
    const program = {
      type: 'Program',
      body: []
    };

    while (this.peek() && this.peek().type !== TokenType.EOF) {
      program.body.push(this.parseStatement());
    }

    return program;
  }

  parseStatement() {
    const token = this.peek();
    if (token.type === TokenType.LET || token.type === TokenType.VAR || token.type === TokenType.CONST) {
      return this.parseVariableDeclaration();
    }
    
    if (token.type === TokenType.FN) {
      return this.parseFunctionDeclaration();
    }

    if (token.type === TokenType.STRUCT) {
      return this.parseStructDeclaration();
    }

    if (token.type === TokenType.RETURN) {
      return this.parseReturnStatement();
    }

    if (token.type === TokenType.IF) {
      return this.parseIfStatement();
    }

    if (token.type === TokenType.WHILE) {
      return this.parseWhileStatement();
    }

    if (token.type === TokenType.FOR) {
      return this.parseForStatement();
    }

    if (token.type === TokenType.LEFT_BRACE) {
      return this.parseBlock();
    }

    // Default to expression statement
    const expression = this.parseExpression();
    this.expect(TokenType.SEMICOLON, "Expected ';' after expression statement");
    return {
      type: 'ExpressionStatement',
      expression
    };
  }

  parseReturnStatement() {
    this.advance(); // skip 'return'
    let argument = null;
    if (this.peek().type !== TokenType.SEMICOLON) {
      argument = this.parseExpression();
    }
    this.expect(TokenType.SEMICOLON, "Expected ';' after return statement");
    return {
      type: 'ReturnStatement',
      argument
    };
  }

  parseIfStatement() {
    this.advance(); // skip 'if'
    this.expect(TokenType.LEFT_PAREN, "Expected '(' after 'if'");
    const test = this.parseExpression();
    this.expect(TokenType.RIGHT_PAREN, "Expected ')' after condition");
    const consequent = this.parseStatement();
    let alternate = null;
    if (this.match(TokenType.ELSE)) {
      alternate = this.parseStatement();
    }
    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    };
  }

  parseWhileStatement() {
    this.advance(); // skip 'while'
    this.expect(TokenType.LEFT_PAREN, "Expected '(' after 'while'");
    const test = this.parseExpression();
    this.expect(TokenType.RIGHT_PAREN, "Expected ')' after condition");
    const body = this.parseStatement();
    return {
      type: 'WhileStatement',
      test,
      body
    };
  }

  parseForStatement() {
    this.advance(); // skip 'for'
    this.expect(TokenType.LEFT_PAREN, "Expected '(' after 'for'");
    
    let init = null;
    if (!this.match(TokenType.SEMICOLON)) {
      init = this.parseStatement(); // Note: parseStatement includes semicolon if it's var decl
    }
    
    let test = null;
    if (!this.match(TokenType.SEMICOLON)) {
      test = this.parseExpression();
      this.expect(TokenType.SEMICOLON, "Expected ';' after for condition");
    }
    
    let update = null;
    if (!this.match(TokenType.RIGHT_PAREN)) {
      update = this.parseExpression();
      this.expect(TokenType.RIGHT_PAREN, "Expected ')' after for update");
    }
    
    const body = this.parseStatement();
    
    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body
    };
  }

  parseVariableDeclaration() {
    const kind = this.advance().value; // let, var, const
    const identifierToken = this.expect(TokenType.IDENTIFIER, "Expected identifier after variable declaration keyword");
    
    let dataType = null;
    if (this.match(TokenType.COLON)) {
      dataType = this.parseType();
    }

    let initializer = null;
    if (this.match(TokenType.ASSIGN)) {
      initializer = this.parseExpression();
    }

    this.expect(TokenType.SEMICOLON, "Expected ';' after variable declaration");

    return {
      type: 'VariableDeclaration',
      kind,
      identifier: identifierToken.value,
      dataType,
      initializer
    };
  }

  parseType() {
    let type = this.baseType();
    
    // Check for array brackets
    while (this.match(TokenType.LEFT_BRACKET)) {
      this.expect(TokenType.RIGHT_BRACKET, "Expected ']' after '[' in type");
      type += '[]';
    }
    
    return type;
  }

  baseType() {
    const token = this.peek();
    if (token && (token.type === TokenType.IDENTIFIER || 
                  token.type === TokenType.INT || 
                  token.type === TokenType.FLOAT || 
                  token.type === TokenType.BOOL || 
                  token.type === TokenType.STRING ||
                  token.type === TokenType.VOID)) {
      return this.advance().value;
    }
    throw new ParserError("Expected type name", token);
  }

  parseFunctionDeclaration() {
    this.advance(); // skip 'fn'
    const identifierToken = this.expect(TokenType.IDENTIFIER, "Expected function name");
    
    this.expect(TokenType.LEFT_PAREN, "Expected '(' after function name");
    const params = [];
    if (this.peek().type !== TokenType.RIGHT_PAREN) {
      do {
        const paramName = this.expect(TokenType.IDENTIFIER, "Expected parameter name").value;
        this.expect(TokenType.COLON, "Expected ':' after parameter name");
        const paramType = this.parseType();
        params.push({ name: paramName, type: paramType });
      } while (this.match(TokenType.COMMA));
    }
    this.expect(TokenType.RIGHT_PAREN, "Expected ')' after parameters");

    let returnType = 'void';
    if (this.match(TokenType.ARROW)) {
      returnType = this.parseType();
    }

    const body = this.parseBlock();

    return {
      type: 'FunctionDeclaration',
      name: identifierToken.value,
      params,
      returnType,
      body
    };
  }

  parseStructDeclaration() {
    this.advance(); // skip 'struct'
    const identifierToken = this.expect(TokenType.IDENTIFIER, "Expected struct name");
    this.expect(TokenType.LEFT_BRACE, "Expected '{' after struct name");
    
    const fields = [];
    while (this.peek() && this.peek().type !== TokenType.RIGHT_BRACE) {
      const fieldName = this.expect(TokenType.IDENTIFIER, "Expected field name").value;
      this.expect(TokenType.COLON, "Expected ':' after field name");
      const fieldType = this.parseType();
      fields.push({ name: fieldName, type: fieldType });
      
      // Optional comma
      this.match(TokenType.COMMA);
    }
    
    this.expect(TokenType.RIGHT_BRACE, "Expected '}' after struct fields");
    
    return {
      type: 'StructDeclaration',
      name: identifierToken.value,
      fields
    };
  }

  parseBlock() {
    this.expect(TokenType.LEFT_BRACE, "Expected '{'");
    const body = [];
    while (this.peek() && this.peek().type !== TokenType.RIGHT_BRACE) {
      body.push(this.parseStatement());
    }
    this.expect(TokenType.RIGHT_BRACE, "Expected '}'");
    return {
      type: 'BlockStatement',
      body
    };
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    const left = this.parseComparison();
    
    if (this.match(TokenType.ASSIGN)) {
      const right = this.parseExpression();
      return {
        type: 'AssignmentExpression',
        left,
        right
      };
    }
    
    return left;
  }

  parseComparison() {
    let left = this.parseAdditive();

    while (this.peek() && (
      this.peek().type === TokenType.EQUAL ||
      this.peek().type === TokenType.NOT_EQUAL ||
      this.peek().type === TokenType.LESS_THAN ||
      this.peek().type === TokenType.GREATER_THAN ||
      this.peek().type === TokenType.LESS_EQUAL ||
      this.peek().type === TokenType.GREATER_EQUAL
    )) {
      const operator = this.advance().value;
      const right = this.parseAdditive();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right
      };
    }

    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.peek() && (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS)) {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right
      };
    }

    return left;
  }

  parseMultiplicative() {
    let left = this.parseCall();

    while (this.peek() && (
      this.peek().type === TokenType.MULTIPLY || 
      this.peek().type === TokenType.DIVIDE ||
      this.peek().type === TokenType.MODULO
    )) {
      const operator = this.advance().value;
      const right = this.parseCall();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right
      };
    }

    return left;
  }

  parseCall() {
    let expr = this.parseMember();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        const args = [];
        if (this.peek().type !== TokenType.RIGHT_PAREN) {
          do {
            args.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
        }
        this.expect(TokenType.RIGHT_PAREN, "Expected ')' after arguments");
        expr = {
          type: 'CallExpression',
          callee: expr,
          arguments: args
        };
      } else if (this.match(TokenType.LEFT_BRACKET)) {
        const index = this.parseExpression();
        this.expect(TokenType.RIGHT_BRACKET, "Expected ']' after array index");
        expr = {
          type: 'IndexExpression',
          object: expr,
          index: index
        };
      } else if (this.match(TokenType.DOT)) {
        const property = this.expect(TokenType.IDENTIFIER, "Expected property name after '.'");
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: property.value
        };
      } else {
        break;
      }
    }

    return expr;
  }

  parseMember() {
    return this.parseUnary();
  }

  parseUnary() {
    if (this.match(TokenType.MINUS) || this.match(TokenType.LOGICAL_NOT)) {
      const operator = this.tokens[this.position - 1].value;
      const argument = this.parseUnary();
      return {
        type: 'UnaryExpression',
        operator,
        argument
      };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.peek();
    
    if (this.match(TokenType.INTEGER_LITERAL)) {
      return { type: 'Literal', value: token.value, raw: token.value.toString() };
    }

    if (this.match(TokenType.FLOAT_LITERAL)) {
      return { type: 'Literal', value: token.value, raw: token.value.toString() };
    }
    
    if (this.match(TokenType.STRING_LITERAL)) {
      return { type: 'Literal', value: token.value, raw: `"${token.value}"` };
    }

    if (this.match(TokenType.TRUE) || this.match(TokenType.FALSE)) {
      return { type: 'Literal', value: token.type === TokenType.TRUE, raw: token.value };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: token.value };
    }

    if (this.match(TokenType.LEFT_BRACKET)) {
      const elements = [];
      if (this.peek().type !== TokenType.RIGHT_BRACKET) {
        do {
          elements.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
      }
      this.expect(TokenType.RIGHT_BRACKET, "Expected ']' after array literal");
      return {
        type: 'ArrayLiteral',
        elements
      };
    }

    throw new ParserError("Unexpected token in expression", token);
  }
}

module.exports = { Parser, ParserError };

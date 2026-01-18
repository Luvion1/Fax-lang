import { Lexer } from "../lexer/index.js";
import { TokenType } from "../lexer/types.js";
import type { Token } from "../lexer/types.js";
import { NodeType } from "./ast/nodes.js";
import type { ASTNode } from "./ast/nodes.js";

// Precedence levels
const LOWEST = 1;
const OR = 2;         // ||
const AND = 3;        // &&
const ASSIGNMENT = 4; // x = y
const EQUALS = 5;     // ==
const LESSGREATER = 6; // > or <
const SUM = 7;         // +
const PRODUCT = 8;     // *
const PREFIX = 9;      // -X or !X
const CALL = 10;        // myFunction(X)

export class Parser {
  lexer: Lexer;
  curToken: any = null;
  peekToken: any = null;
  errors: string[] = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): ASTNode {
    const program: ASTNode = { type: NodeType.Program, statements: [] };
    while (this.curToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt) program.statements.push(stmt);
      this.nextToken();
    }
    return program;
  }

  parseStatement(): ASTNode | null {
    switch (this.curToken.type) {
      case TokenType.Let: return this.parseLetStatement();
      case TokenType.Shadow: return this.parseShadowStatement();
      case TokenType.Const: return this.parseConstStatement();
      case TokenType.Return: return this.parseReturnStatement();
      case TokenType.While: return this.parseWhileStatement();
      case TokenType.StateMachine: return this.parseStateMachine();
      case TokenType.Fn: return this.parseFunctionDeclaration();
      case TokenType.LeftBrace: return this.parseBlockStatement();
      default: return this.parseExpressionStatement();
    }
  }

  parseFunctionDeclaration(): ASTNode | null {
    const stmt: ASTNode = { type: "FunctionDeclaration", token: this.curToken };
    if (!this.expectPeek(TokenType.Identifier)) return null;
    stmt.name = { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
    
    if (!this.expectPeek(TokenType.LeftParen)) return null;
    stmt.params = this.parseFunctionParameters();
    
    if (this.peekTokenIs(TokenType.Arrow)) {
        this.nextToken(); // ->
        this.nextToken(); // return type
        stmt.returnType = this.curToken.literal;
    }

    if (!this.expectPeek(TokenType.LeftBrace)) return null;
    stmt.body = this.parseBlockStatement();
    return stmt;
  }

  parseFunctionParameters(): ASTNode[] {
      const params: ASTNode[] = [];
      if (this.peekTokenIs(TokenType.RightParen)) {
          this.nextToken();
          return params;
      }
      this.nextToken();
      
      const firstParam: any = { type: NodeType.Identifier, value: this.curToken.literal };
      if (this.peekTokenIs(TokenType.Colon)) {
          this.nextToken(); // :
          this.nextToken(); // type
          firstParam.dataType = this.curToken.literal;
      }
      params.push(firstParam);

      while (this.peekTokenIs(TokenType.Comma)) {
          this.nextToken(); // ,
          if (!this.expectPeek(TokenType.Identifier)) return [];
          const param: any = { type: NodeType.Identifier, value: this.curToken.literal };
          if (this.peekTokenIs(TokenType.Colon)) {
              this.nextToken(); // :
              this.nextToken(); // type
              param.dataType = this.curToken.literal;
          }
          params.push(param);
      }
      if (!this.expectPeek(TokenType.RightParen)) return [];
      return params;
  }

  parseLetStatement(): ASTNode | null {
    const stmt: ASTNode = { type: NodeType.LetStatement, token: this.curToken };
    
    let isMut = false;
    if (this.peekTokenIs(TokenType.Mut)) {
        this.nextToken();
        isMut = true;
    }
    stmt.isMut = isMut;

    if (!this.expectPeek(TokenType.Identifier)) return null;
    stmt.name = { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
    
    // Optional type annotation
    if (this.peekTokenIs(TokenType.Colon)) {
        this.nextToken(); // :
        this.nextToken(); // type
        stmt.dataType = this.curToken.literal;
    }

    if (!this.expectPeek(TokenType.Equal)) return null;
    this.nextToken();
    stmt.value = this.parseExpression(LOWEST);
    if (this.peekTokenIs(TokenType.Semicolon)) this.nextToken();
    return stmt;
  }

  parseShadowStatement(): ASTNode | null {
    const stmt: ASTNode = { type: "ShadowStatement", token: this.curToken };
    if (!this.expectPeek(TokenType.Identifier)) return null;
    stmt.name = { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
    if (!this.expectPeek(TokenType.Equal)) return null;
    this.nextToken();
    stmt.value = this.parseExpression(LOWEST);
    if (this.peekTokenIs(TokenType.Semicolon)) this.nextToken();
    return stmt;
  }

  parseConstStatement(): ASTNode | null {
    const stmt: ASTNode = { type: "ConstStatement", token: this.curToken };
    if (!this.expectPeek(TokenType.Identifier)) return null;
    stmt.name = { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
    if (!this.expectPeek(TokenType.Equal)) return null;
    this.nextToken();
    stmt.value = this.parseExpression(LOWEST);
    if (this.peekTokenIs(TokenType.Semicolon)) this.nextToken();
    return stmt;
  }

  parseReturnStatement(): ASTNode | null {
    const stmt: ASTNode = { type: NodeType.ReturnStatement, token: this.curToken };
    this.nextToken();
    stmt.returnValue = this.parseExpression(LOWEST);
    if (this.peekTokenIs(TokenType.Semicolon)) this.nextToken();
    return stmt;
  }

  parseWhileStatement(): ASTNode | null {
    const stmt: ASTNode = { type: "WhileStatement", token: this.curToken };
    this.nextToken();
    stmt.condition = this.parseExpression(LOWEST);
    if (!this.expectPeek(TokenType.LeftBrace)) return null;
    stmt.body = this.parseBlockStatement();
    return stmt;
  }

  parseExpressionStatement(): ASTNode | null {
    const expr = this.parseExpression(LOWEST);
    if (!expr) return null;
    const stmt: ASTNode = { type: NodeType.ExpressionStatement, token: this.curToken, expression: expr };
    if (this.peekTokenIs(TokenType.Semicolon)) this.nextToken();
    return stmt;
  }

  parseBlockStatement(): ASTNode {
    const block: ASTNode = { type: NodeType.BlockStatement, token: this.curToken, statements: [] };
    this.nextToken(); // consume {
    while (!this.curTokenIs(TokenType.RightBrace) && !this.curTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) block.statements.push(stmt);
      this.nextToken();
    }
    return block;
  }

  parseStateMachine(): ASTNode | null {
    const stmt: ASTNode = { type: NodeType.StateMachine, token: this.curToken };
    if (!this.expectPeek(TokenType.Identifier)) return null;
    stmt.name = { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
    if (!this.expectPeek(TokenType.LeftBrace)) return null;
    stmt.states = [];
    stmt.dataFields = [];
    this.nextToken();
    while (!this.curTokenIs(TokenType.RightBrace) && !this.curTokenIs(TokenType.EOF)) {
      if (this.curTokenIs(TokenType.State)) {
        stmt.states.push(this.parseStateDefinition());
      } else if (this.curTokenIs(TokenType.Data)) {
        stmt.dataFields = this.parseDataBlock();
      } else if (this.curTokenIs(TokenType.Any)) {
        stmt.anyTransitions = this.parseAnyBlock();
      }
      this.nextToken();
    }
    return stmt;
  }

  parseAnyBlock(): any[] {
      const transitions: any[] = [];
      if (!this.expectPeek(TokenType.LeftBrace)) return transitions;
      this.nextToken();
      while (!this.curTokenIs(TokenType.RightBrace) && !this.curTokenIs(TokenType.EOF)) {
          if (this.curTokenIs(TokenType.Fn)) {
              const transition: any = { type: NodeType.StateTransition, token: this.curToken };
              if (!this.expectPeek(TokenType.Identifier)) return [];
              transition.name = this.curToken.literal;
              
              if (!this.expectPeek(TokenType.LeftParen)) return [];
              transition.params = this.parseFunctionParameters();
              
              if (this.peekTokenIs(TokenType.Arrow)) {
                  this.nextToken(); // ->
                  if (!this.expectPeek(TokenType.Identifier)) return [];
                  transition.target = this.curToken.literal;
              }

              if (!this.expectPeek(TokenType.LeftBrace)) return [];
              transition.body = this.parseBlockStatement();
              transitions.push(transition);
          }
          this.nextToken();
      }
      return transitions;
  }

  parseDataBlock(): ASTNode[] {
      const fields: ASTNode[] = [];
      if (!this.expectPeek(TokenType.LeftBrace)) return fields;
      this.nextToken();
      while (!this.curTokenIs(TokenType.RightBrace) && !this.curTokenIs(TokenType.EOF)) {
          if (this.curTokenIs(TokenType.Identifier)) {
              const name = this.curToken.literal;
              if (!this.expectPeek(TokenType.Colon)) break;
              this.nextToken(); // type
              fields.push({ type: "DataField", name, dataType: this.curToken.literal });
              if (this.peekTokenIs(TokenType.Comma)) this.nextToken();
          }
          this.nextToken();
      }
      return fields;
  }

  parseStateDefinition(): ASTNode | null {
    const stateNode: ASTNode = { type: NodeType.StateDefinition, token: this.curToken };
    if (!this.expectPeek(TokenType.Identifier)) return null;
    stateNode.name = { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
    if (!this.expectPeek(TokenType.LeftBrace)) return null;
    stateNode.transitions = [];
    this.nextToken();
    while (!this.curTokenIs(TokenType.RightBrace) && !this.curTokenIs(TokenType.EOF)) {
        if (this.curTokenIs(TokenType.Fn)) {
            const transition: any = { type: NodeType.StateTransition, token: this.curToken };
            if (!this.expectPeek(TokenType.Identifier)) return null;
            transition.name = this.curToken.literal;
            
            if (!this.expectPeek(TokenType.LeftParen)) return null;
            transition.params = this.parseFunctionParameters();
            
            if (this.peekTokenIs(TokenType.Arrow)) {
                this.nextToken(); // ->
                if (!this.expectPeek(TokenType.Identifier)) return null;
                transition.target = this.curToken.literal;
            }

            if (!this.expectPeek(TokenType.LeftBrace)) return null;
            transition.body = this.parseBlockStatement();
            stateNode.transitions.push(transition);
        }
        this.nextToken();
    }
    return stateNode;
  }

  parseExpression(precedence: number): ASTNode | null {
    let leftExp = this.parsePrefix();
    if (!leftExp) return null;

    while (!this.peekTokenIs(TokenType.Semicolon) && !this.peekTokenIs(TokenType.RightBrace) && !this.peekTokenIs(TokenType.Comma) && precedence < this.peekPrecedence()) {
      const infixFn = this.getInfixFn(this.peekToken.type);
      if (!infixFn) return leftExp;
      this.nextToken();
      leftExp = infixFn(leftExp);
    }
    return leftExp;
  }

  private getInfixFn(type: string): ((left: ASTNode) => ASTNode) | null {
    switch (type) {
      case TokenType.Plus: case TokenType.Minus:
      case TokenType.Star: case TokenType.Slash:
      case TokenType.Greater: case TokenType.Less:
      case TokenType.EqualEqual: case TokenType.BangEqual:
      case TokenType.And: case TokenType.Or:
        return this.parseInfixExpression.bind(this);
      case TokenType.Equal:
        return this.parseAssignmentExpression.bind(this);
      case TokenType.LeftParen:
        return this.parseCallExpression.bind(this);
      default: return null;
    }
  }

  parseCallExpression(left: ASTNode): ASTNode {
      const expr: ASTNode = { type: NodeType.CallExpression, token: this.curToken, function: left };
      expr.arguments = this.parseCallArguments();
      return expr;
  }

  parseCallArguments(): ASTNode[] {
      const args: ASTNode[] = [];
      if (this.peekTokenIs(TokenType.RightParen)) {
          this.nextToken();
          return args;
      }
      this.nextToken();
      args.push(this.parseExpression(LOWEST)!);
      while (this.peekTokenIs(TokenType.Comma)) {
          this.nextToken();
          this.nextToken();
          args.push(this.parseExpression(LOWEST)!);
      }
      if (!this.expectPeek(TokenType.RightParen)) return [];
      return args;
  }

  parseInfixExpression(left: ASTNode): ASTNode {
    const stmt: ASTNode = { type: NodeType.InfixExpression, token: this.curToken, operator: this.curToken.literal, left: left };
    const precedence = this.curPrecedence();
    this.nextToken();
    stmt.right = this.parseExpression(precedence);
    return stmt;
  }

  parseAssignmentExpression(left: ASTNode): ASTNode {
      const expr: ASTNode = { type: "AssignmentExpression", token: this.curToken, name: left };
      this.nextToken();
      expr.value = this.parseExpression(LOWEST);
      return expr;
  }

  parsePrefix(): ASTNode | null {
    switch (this.curToken.type) {
      case TokenType.Identifier: return { type: NodeType.Identifier, token: this.curToken, value: this.curToken.literal };
      case TokenType.Number: return { type: NodeType.IntegerLiteral, token: this.curToken, value: parseInt(this.curToken.literal) };
      case TokenType.If: return this.parseIfExpression();
      default: return null;
    }
  }

  parseIfExpression(): ASTNode {
    const expr: ASTNode = { type: "IfExpression", token: this.curToken };
    this.nextToken();
    expr.condition = this.parseExpression(LOWEST);
    if (!this.expectPeek(TokenType.LeftBrace)) return expr;
    expr.consequence = this.parseBlockStatement();
    if (this.peekTokenIs(TokenType.ElseIf)) {
        this.nextToken();
        expr.alternative = this.parseIfExpression();
    } else if (this.peekTokenIs(TokenType.Else)) {
        this.nextToken();
        if (!this.expectPeek(TokenType.LeftBrace)) return expr;
        expr.alternative = this.parseBlockStatement();
    }
    return expr;
  }

  private curPrecedence() { return this.getPrecedence(this.curToken.type); }
  private peekPrecedence() { return this.getPrecedence(this.peekToken.type); }
  private getPrecedence(type: string): number {
    switch (type) {
      case TokenType.Or: return OR;
      case TokenType.And: return AND;
      case TokenType.Equal: return ASSIGNMENT;
      case TokenType.EqualEqual: case TokenType.BangEqual: return EQUALS;
      case TokenType.Less: case TokenType.Greater: return LESSGREATER;
      case TokenType.Plus: case TokenType.Minus: return SUM;
      case TokenType.Star: case TokenType.Slash: return PRODUCT;
      default: return LOWEST;
    }
  }

  curTokenIs(t: any): boolean { return this.curToken.type === t; }
  peekTokenIs(t: any): boolean { return this.peekToken.type === t; }
  expectPeek(t: any): boolean {
    if (this.peekTokenIs(t)) { this.nextToken(); return true; }
    this.errors.push(`Expected next token to be ${t}, got ${this.peekToken.type}`);
    return false;
  }
}
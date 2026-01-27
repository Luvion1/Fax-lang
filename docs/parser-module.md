# Parser Module Documentation

## Overview
The Parser module converts a stream of tokens into an Abstract Syntax Tree (AST). It implements a recursive descent parser with Pratt parsing for expressions.

## Architecture
The parser is implemented in TypeScript for better tooling and type safety when working with ASTs. It follows a recursive descent approach with Pratt parsing for handling operator precedence.

## API Reference

### `Parser` class
```typescript
class Parser {
  constructor(tokens: Token[])
  parse(): Program
  private peek(offset?: number): Token
  private advance(): Token
  private previous(): Token
  private isAtEnd(): boolean
  private match(...types: TokenType[]): boolean
  private check(type: TokenType): boolean
  private consume(type: TokenType, message: string): Token
  private synchronize(): void
  private declaration(): Statement | null
  private variableDeclaration(): VariableDeclaration
  private functionDeclaration(): FunctionDeclaration
  private statement(): Statement
  private ifStatement(): IfStatement
  private whileStatement(): WhileStatement
  private forStatement(): Statement
  private returnStatement(): ReturnStatement
  private blockStatement(): Statement
  private expression(): Expression
  private assignment(): Expression
  private logicOr(): Expression
  private logicAnd(): Expression
  private equality(): Expression
  private comparison(): Expression
  private term(): Expression
  private factor(): Expression
  private unary(): Expression
  private call(): Expression
  private finishCall(callee: Expression): CallExpression
  private primary(): Expression
}
```

### AST Node Types
```typescript
type AstNode = 
  | Program
  | Statement
  | Expression;

interface Program {
  type: 'Program';
  body: Statement[];
}

type Statement = 
  | VariableDeclaration
  | FunctionDeclaration
  | ExpressionStatement
  | IfStatement
  | WhileStatement
  | ReturnStatement;

interface VariableDeclaration {
  type: 'VariableDeclaration';
  identifier: string;
  dataType?: string;
  initializer?: Expression;
  mutable: boolean;
}

interface FunctionDeclaration {
  type: 'FunctionDeclaration';
  name: string;
  parameters: { name: string; dataType: string }[];
  returnType?: string;
  body: Statement[];
}

interface ExpressionStatement {
  type: 'ExpressionStatement';
  expression: Expression;
}

interface IfStatement {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement[];
  alternate?: Statement[];
}

interface WhileStatement {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

interface ReturnStatement {
  type: 'ReturnStatement';
  argument?: Expression;
}

type Expression = 
  | Identifier
  | Literal
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression;

interface Identifier {
  type: 'Identifier';
  name: string;
}

interface Literal {
  type: 'Literal';
  value: string | number | boolean;
}

interface BinaryExpression {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

interface UnaryExpression {
  type: 'UnaryExpression';
  operator: string;
  argument: Expression;
}

interface CallExpression {
  type: 'CallExpression';
  callee: Identifier;
  arguments: Expression[];
}

interface MemberExpression {
  type: 'MemberExpression';
  object: Expression;
  property: Identifier;
  computed: boolean;
}
```

### `ParserError` class
```typescript
class ParserError extends Error {
  line: number;
  column: number;
  position?: number;
  errorType: ErrorType;
}
```

### `ErrorType` enum
```typescript
enum ErrorType {
  SyntaxError = 'SyntaxError',
  TypeError = 'TypeError',
  NameError = 'NameError',
  ValueError = 'ValueError',
  RuntimeError = 'RuntimeError'
}
```

## Implementation Details

### Pratt Parsing
The parser uses Pratt parsing for handling expressions with different precedence levels. This allows for clean handling of operator precedence and associativity.

### Error Recovery
The parser implements panic mode error recovery using the `synchronize()` method to recover from syntax errors and continue parsing.

### Recursive Descent
The statement parsing follows a classic recursive descent approach, with each statement type having its own parsing method.

## Error Handling
The parser provides detailed error information including line, column, and position when encountering syntax errors. It also categorizes errors by type.

## Performance Considerations
- Uses a single-pass approach for parsing
- Minimizes backtracking through proper token lookahead
- Efficient handling of operator precedence through Pratt parsing
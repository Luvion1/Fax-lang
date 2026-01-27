# Lexer Module Documentation

## Overview
The Lexer module is responsible for converting source code into a stream of tokens. It implements a state machine that recognizes different lexical elements of the Fax language.

## Architecture
The lexer is implemented in Rust for performance and memory safety. It follows a simple state machine approach to recognize tokens.

## API Reference

### `Lexer` struct
```rust
pub struct Lexer {
    input: Vec<char>,
    position: usize,
    line: usize,
    column: usize,
    absolute_position: usize,
}
```

#### Methods
- `new(input: &str) -> Self`: Creates a new lexer instance with the provided input string
- `current_char(&self) -> Option<char>`: Returns the current character being processed
- `peek(&self, offset: usize) -> Option<char>`: Peeks ahead at a character without advancing position
- `advance(&mut self)`: Advances the lexer to the next character
- `next_token(&mut self) -> Result<Token, LexerError>`: Returns the next token from the input
- `tokenize(&mut self) -> Result<Vec<Token>, LexerError>`: Tokenizes the entire input and returns a vector of tokens

### `Token` struct
```rust
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
    pub line: usize,
    pub column: usize,
}
```

### `TokenType` enum
```rust
pub enum TokenType {
    // Keywords
    Let, Var, Const, Fn, Struct, Enum, If, Else, While, For, Return, 
    Pub, Priv, Static, Int, Float, Bool, String, Char, Void, True, False,

    // Identifiers
    Identifier(String),

    // Literals
    IntegerLiteral(i64),
    FloatLiteral(f64),
    StringLiteral(String),
    BooleanLiteral(bool),
    HexLiteral(i64),
    BinaryLiteral(i64),
    OctalLiteral(i64),

    // Operators
    Plus, Minus, Multiply, Divide, Modulo, Assign, Equal, NotEqual, 
    LessThan, GreaterThan, LessEqual, GreaterEqual, LogicalAnd, LogicalOr, 
    LogicalNot, BitwiseAnd, BitwiseOr, BitwiseXor, BitwiseNot, 
    LeftShift, RightShift, PlusAssign, MinusAssign, MultiplyAssign, 
    DivideAssign, ModuloAssign,

    // Punctuation
    LeftParen, RightParen, LeftBrace, RightBrace, LeftBracket, RightBracket, 
    Semicolon, Comma, Dot, Colon, DoubleColon, Arrow,

    // Special
    Eof,
}
```

### `LexerError` struct
```rust
pub struct LexerError {
    pub message: String,
    pub line: usize,
    pub column: usize,
    pub position: usize,
}
```

## Implementation Details

### Number Recognition
The lexer handles different number formats:
- Decimal integers: `42`, `-17`
- Floats: `3.14`, `-2.0`
- Hexadecimal: `0xFF`, `0xab12`
- Binary: `0b1010`, `0b11110000`
- Octal: `0o755`, `0o123`

### String Handling
Strings support escape sequences like `\n`, `\t`, `\\`, etc. The lexer properly handles both single and double-quoted strings.

### Comments
The lexer supports both single-line (`// comment`) and multi-line (`/* comment */`) comments.

## Error Handling
The lexer provides detailed error information including line, column, and absolute position when encountering invalid tokens.

## Performance Considerations
- Uses `Vec<char>` for efficient character access
- Implements manual character iteration for performance
- Minimizes allocations during tokenization
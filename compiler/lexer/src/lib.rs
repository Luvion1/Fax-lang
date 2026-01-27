use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum TokenType {
    // Keywords
    Let,
    Var,
    Const,
    Fn,
    Struct,
    Enum,
    If,
    Else,
    While,
    For,
    Return,
    Pub,
    Priv,
    Static,
    Int,
    Float,
    Bool,
    String,
    Char,
    Void,
    True,
    False,

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
    Plus,
    Minus,
    Multiply,
    Divide,
    Modulo,
    Assign,
    Equal,
    NotEqual,
    LessThan,
    GreaterThan,
    LessEqual,
    GreaterEqual,
    LogicalAnd,
    LogicalOr,
    LogicalNot,
    BitwiseAnd,
    BitwiseOr,
    BitwiseXor,
    BitwiseNot,
    LeftShift,
    RightShift,
    PlusAssign,
    MinusAssign,
    MultiplyAssign,
    DivideAssign,
    ModuloAssign,

    // Punctuation
    LeftParen,
    RightParen,
    LeftBrace,
    RightBrace,
    LeftBracket,
    RightBracket,
    Semicolon,
    Comma,
    Dot,
    Colon,
    DoubleColon,
    Arrow,

    // Special
    Eof,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
    pub line: usize,
    pub column: usize,
}

impl fmt::Display for Token {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Token({:?}, '{}', {}: {})",
            self.token_type, self.value, self.line, self.column
        )
    }
}

#[derive(Debug)]
pub struct LexerError {
    pub message: String,
    pub line: usize,
    pub column: usize,
    pub position: usize,
}

impl fmt::Display for LexerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "LexerError at {}:{} (pos={}): {}", self.line, self.column, self.position, self.message)
    }
}

impl std::error::Error for LexerError {}

// Define different types of lexer errors
#[derive(Debug, Clone)]
pub enum LexerErrorType {
    InvalidCharacter,
    UnterminatedString,
    InvalidNumber,
    UnexpectedEof,
    IoError,
}

impl LexerError {
    pub fn new(message: String, line: usize, column: usize, position: usize) -> Self {
        Self {
            message,
            line,
            column,
            position,
        }
    }

    pub fn with_type(error_type: LexerErrorType, line: usize, column: usize, position: usize) -> Self {
        let message = match error_type {
            LexerErrorType::InvalidCharacter => "Invalid character".to_string(),
            LexerErrorType::UnterminatedString => "Unterminated string literal".to_string(),
            LexerErrorType::InvalidNumber => "Invalid number format".to_string(),
            LexerErrorType::UnexpectedEof => "Unexpected end of file".to_string(),
            LexerErrorType::IoError => "IO error during lexing".to_string(),
        };

        Self {
            message,
            line,
            column,
            position,
        }
    }
}

pub struct Lexer {
    input: Vec<char>,
    position: usize,
    line: usize,
    column: usize,
    absolute_position: usize,
}

impl Lexer {
    pub fn new(input: &str) -> Self {
        Self {
            input: input.chars().collect(),
            position: 0,
            line: 1,
            column: 1,
            absolute_position: 0,
        }
    }

    fn current_char(&self) -> Option<char> {
        self.input.get(self.position).copied()
    }

    fn peek(&self, offset: usize) -> Option<char> {
        self.input.get(self.position + offset).copied()
    }

    fn advance(&mut self) {
        if let Some(ch) = self.current_char() {
            if ch == '\n' {
                self.line += 1;
                self.column = 1;
            } else {
                self.column += 1;
            }
            self.position += 1;
            self.absolute_position += 1;
        }
    }

    fn skip_whitespace(&mut self) {
        while let Some(ch) = self.current_char() {
            if ch.is_whitespace() && ch != '\n' {
                self.advance();
            } else {
                break;
            }
        }
    }

    fn skip_comment(&mut self) {
        if self.current_char() == Some('/') && self.peek(1) == Some('/') {
            // Skip single-line comment
            while let Some(ch) = self.current_char() {
                if ch == '\n' {
                    break;
                }
                self.advance();
            }
        } else if self.current_char() == Some('/') && self.peek(1) == Some('*') {
            // Skip multi-line comment
            self.advance(); // skip first '/'
            self.advance(); // skip '*'
            while let Some(ch) = self.current_char() {
                if ch == '*' && self.peek(1) == Some('/') {
                    self.advance(); // skip '*'
                    self.advance(); // skip '/'
                    break;
                }
                self.advance();
            }
        }
    }

    fn read_number(&mut self) -> Result<TokenType, LexerError> {
        let start_line = self.line;
        let start_column = self.column;
        let start_pos = self.absolute_position;

        // Handle hexadecimal, binary, octal prefixes
        if self.current_char() == Some('0') && self.peek(1) == Some('x') {
            self.advance(); // skip '0'
            self.advance(); // skip 'x'

            // Read hexadecimal digits
            while let Some(ch) = self.current_char() {
                if ch.is_ascii_hexdigit() {
                    self.advance();
                } else {
                    break;
                }
            }

            let num_str: String = self.input[start_pos..self.position].iter().collect();
            if num_str.len() <= 2 {
                return Err(LexerError::new(
                    format!("Invalid hexadecimal number: {}", num_str),
                    start_line,
                    start_column,
                    start_pos
                ));
            }

            let value = i64::from_str_radix(&num_str[2..], 16)
                .map_err(|_| LexerError::new(
                    format!("Invalid hexadecimal number: {}", num_str),
                    start_line,
                    start_column,
                    start_pos
                ))?;

            return Ok(TokenType::HexLiteral(value));
        } else if self.current_char() == Some('0') && self.peek(1) == Some('b') {
            self.advance(); // skip '0'
            self.advance(); // skip 'b'

            // Read binary digits
            while let Some(ch) = self.current_char() {
                if ch == '0' || ch == '1' {
                    self.advance();
                } else {
                    break;
                }
            }

            let num_str: String = self.input[start_pos..self.position].iter().collect();
            if num_str.len() <= 2 {
                return Err(LexerError::new(
                    format!("Invalid binary number: {}", num_str),
                    start_line,
                    start_column,
                    start_pos
                ));
            }

            let value = i64::from_str_radix(&num_str[2..], 2)
                .map_err(|_| LexerError::new(
                    format!("Invalid binary number: {}", num_str),
                    start_line,
                    start_column,
                    start_pos
                ))?;

            return Ok(TokenType::BinaryLiteral(value));
        } else if self.current_char() == Some('0') && self.peek(1).map_or(false, |c| ('0'..='7').contains(&c)) {
            self.advance(); // skip '0'

            // Read octal digits
            while let Some(ch) = self.current_char() {
                if ('0'..='7').contains(&ch) {
                    self.advance();
                } else {
                    break;
                }
            }

            let num_str: String = self.input[start_pos..self.position].iter().collect();
            if num_str.len() <= 1 {
                return Err(LexerError::new(
                    format!("Invalid octal number: {}", num_str),
                    start_line,
                    start_column,
                    start_pos
                ));
            }

            let value = i64::from_str_radix(&num_str[1..], 8)
                .map_err(|_| LexerError::new(
                    format!("Invalid octal number: {}", num_str),
                    start_line,
                    start_column,
                    start_pos
                ))?;

            return Ok(TokenType::OctalLiteral(value));
        } else {
            // Read decimal number (possibly with decimal point)
            while let Some(ch) = self.current_char() {
                if ch.is_ascii_digit() || ch == '.' {
                    self.advance();
                } else {
                    break;
                }
            }

            let num_str: String = self.input[start_pos..self.position].iter().collect();

            if num_str.contains('.') {
                let value = num_str.parse::<f64>()
                    .map_err(|_| LexerError::new(
                        format!("Invalid float number: {}", num_str),
                        start_line,
                        start_column,
                        start_pos
                    ))?;

                return Ok(TokenType::FloatLiteral(value));
            } else {
                let value = num_str.parse::<i64>()
                    .map_err(|_| LexerError::new(
                        format!("Invalid integer number: {}", num_str),
                        start_line,
                        start_column,
                        start_pos
                    ))?;

                return Ok(TokenType::IntegerLiteral(value));
            }
        }
    }

    fn read_string(&mut self) -> Result<TokenType, LexerError> {
        let quote = self.current_char().unwrap();
        let start_line = self.line;
        let start_column = self.column;
        let start_pos = self.absolute_position;

        self.advance(); // skip opening quote

        let mut str_value = String::new();

        while let Some(ch) = self.current_char() {
            if ch == '\\' {
                self.advance(); // skip escape character
                if let Some(escaped_ch) = self.current_char() {
                    match escaped_ch {
                        'n' => str_value.push('\n'),
                        't' => str_value.push('\t'),
                        'r' => str_value.push('\r'),
                        '\\' => str_value.push('\\'),
                        '\'' | '"' => str_value.push(escaped_ch),
                        _ => str_value.push(escaped_ch),
                    }
                    self.advance();
                } else {
                    return Err(LexerError::new(
                        "Unterminated escape sequence in string".to_string(),
                        self.line,
                        self.column,
                        self.absolute_position
                    ));
                }
            } else if ch == quote {
                self.advance(); // skip closing quote
                break;
            } else {
                str_value.push(ch);
                self.advance();
            }
        }

        if self.current_char() != Some(quote) {
            return Err(LexerError::with_type(
                LexerErrorType::UnterminatedString,
                start_line,
                start_column,
                start_pos
            ));
        }

        Ok(TokenType::StringLiteral(str_value))
    }

    fn read_identifier(&mut self) -> String {
        let start_pos = self.position;
        
        while let Some(ch) = self.current_char() {
            if ch.is_alphanumeric() || ch == '_' {
                self.advance();
            } else {
                break;
            }
        }
        
        self.input[start_pos..self.position].iter().collect()
    }

    fn lookup_keyword(&self, identifier: &str) -> TokenType {
        match identifier {
            "let" => TokenType::Let,
            "var" => TokenType::Var,
            "const" => TokenType::Const,
            "fn" => TokenType::Fn,
            "struct" => TokenType::Struct,
            "enum" => TokenType::Enum,
            "if" => TokenType::If,
            "else" => TokenType::Else,
            "while" => TokenType::While,
            "for" => TokenType::For,
            "return" => TokenType::Return,
            "pub" => TokenType::Pub,
            "priv" => TokenType::Priv,
            "static" => TokenType::Static,
            "int" => TokenType::Int,
            "float" => TokenType::Float,
            "bool" => TokenType::Bool,
            "string" => TokenType::String,
            "char" => TokenType::Char,
            "void" => TokenType::Void,
            "true" => TokenType::BooleanLiteral(true),
            "false" => TokenType::BooleanLiteral(false),
            _ => TokenType::Identifier(identifier.to_string()),
        }
    }

    pub fn next_token(&mut self) -> Result<Token, LexerError> {
        self.skip_whitespace();
        self.skip_comment();
        self.skip_whitespace();

        if let Some(current_char) = self.current_char() {
            let token = match current_char {
                // Single character tokens
                '(' => Token {
                    token_type: TokenType::LeftParen,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                ')' => Token {
                    token_type: TokenType::RightParen,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                '{' => Token {
                    token_type: TokenType::LeftBrace,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                '}' => Token {
                    token_type: TokenType::RightBrace,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                '[' => Token {
                    token_type: TokenType::LeftBracket,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                ']' => Token {
                    token_type: TokenType::RightBracket,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                ';' => Token {
                    token_type: TokenType::Semicolon,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                ',' => Token {
                    token_type: TokenType::Comma,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                '.' => Token {
                    token_type: TokenType::Dot,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                ':' => {
                    if self.peek(1) == Some(':') {
                        self.advance(); // consume ':'
                        Token {
                            token_type: TokenType::DoubleColon,
                            value: "::".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Colon,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '-' => {
                    if self.peek(1) == Some('>') {
                        self.advance(); // consume '>'
                        Token {
                            token_type: TokenType::Arrow,
                            value: "->".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::MinusAssign,
                            value: "-=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Minus,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '+' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::PlusAssign,
                            value: "+=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Plus,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '*' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::MultiplyAssign,
                            value: "*=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Multiply,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '/' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::DivideAssign,
                            value: "/=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Divide,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '%' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::ModuloAssign,
                            value: "%=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Modulo,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '!' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::NotEqual,
                            value: "!=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::LogicalNot,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '=' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::Equal,
                            value: "==".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::Assign,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '<' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::LessEqual,
                            value: "<=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else if self.peek(1) == Some('<') {
                        self.advance(); // consume '<'
                        if self.peek(1) == Some('=') {
                            self.advance(); // consume '='
                            Token {
                                token_type: TokenType::LeftShift,
                                value: "<<=".to_string(),
                                line: self.line,
                                column: self.column,
                            }
                        } else {
                            Token {
                                token_type: TokenType::LeftShift,
                                value: "<<".to_string(),
                                line: self.line,
                                column: self.column,
                            }
                        }
                    } else {
                        Token {
                            token_type: TokenType::LessThan,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '>' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::GreaterEqual,
                            value: ">=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else if self.peek(1) == Some('>') {
                        self.advance(); // consume '>'
                        if self.peek(1) == Some('=') {
                            self.advance(); // consume '='
                            Token {
                                token_type: TokenType::RightShift,
                                value: ">>=".to_string(),
                                line: self.line,
                                column: self.column,
                            }
                        } else {
                            Token {
                                token_type: TokenType::RightShift,
                                value: ">>".to_string(),
                                line: self.line,
                                column: self.column,
                            }
                        }
                    } else {
                        Token {
                            token_type: TokenType::GreaterThan,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '&' => {
                    if self.peek(1) == Some('&') {
                        self.advance(); // consume '&'
                        Token {
                            token_type: TokenType::LogicalAnd,
                            value: "&&".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::BitwiseAnd,
                            value: "&=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::BitwiseAnd,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '|' => {
                    if self.peek(1) == Some('|') {
                        self.advance(); // consume '|'
                        Token {
                            token_type: TokenType::LogicalOr,
                            value: "||".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::BitwiseOr,
                            value: "|=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::BitwiseOr,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '^' => {
                    if self.peek(1) == Some('=') {
                        self.advance(); // consume '='
                        Token {
                            token_type: TokenType::BitwiseXor,
                            value: "^=".to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    } else {
                        Token {
                            token_type: TokenType::BitwiseXor,
                            value: current_char.to_string(),
                            line: self.line,
                            column: self.column,
                        }
                    }
                },
                '~' => Token {
                    token_type: TokenType::BitwiseNot,
                    value: current_char.to_string(),
                    line: self.line,
                    column: self.column,
                },
                '"' | '\'' => {
                    let token_type = self.read_string()?;
                    let value = if let TokenType::StringLiteral(s) = &token_type {
                        s.clone()
                    } else {
                        "".to_string()
                    };
                    Token {
                        token_type,
                        value,
                        line: self.line,
                        column: self.column,
                    }
                },
                c if c.is_ascii_digit() => {
                    let token_type = self.read_number()?;
                    let value = match &token_type {
                        TokenType::IntegerLiteral(v) => v.to_string(),
                        TokenType::FloatLiteral(v) => v.to_string(),
                        TokenType::HexLiteral(v) => format!("0x{:x}", v),
                        TokenType::BinaryLiteral(v) => format!("0b{:b}", v),
                        TokenType::OctalLiteral(v) => format!("0o{:o}", v),
                        _ => "".to_string(),
                    };
                    Token {
                        token_type,
                        value,
                        line: self.line,
                        column: self.column,
                    }
                },
                c if c.is_alphabetic() || c == '_' => {
                    let identifier = self.read_identifier();
                    let token_type = self.lookup_keyword(&identifier);
                    let value = match &token_type {
                        TokenType::Identifier(s) => s.clone(),
                        _ => identifier,
                    };
                    Token {
                        token_type,
                        value,
                        line: self.line,
                        column: self.column,
                    }
                },
                _ => {
                    return Err(LexerError::new(
                        format!("Unexpected character: {}", current_char),
                        self.line,
                        self.column,
                        self.absolute_position,
                    ));
                }
            };

            Ok(token)
        } else {
            Ok(Token {
                token_type: TokenType::Eof,
                value: "".to_string(),
                line: self.line,
                column: self.column,
            })
        }
    }

    pub fn tokenize(&mut self) -> Result<Vec<Token>, LexerError> {
        let mut tokens = Vec::new();

        loop {
            let token = self.next_token()?;
            tokens.push(token.clone());
            
            if matches!(token.token_type, TokenType::Eof) {
                break;
            }
        }

        Ok(tokens)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_tokenization() {
        let input = "let x = 42;";
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        assert_eq!(tokens.len(), 5); // let, x, =, 42, ;
        assert_eq!(tokens[0].token_type, TokenType::Let);
        assert_eq!(tokens[1].token_type, TokenType::Identifier("x".to_string()));
        assert_eq!(tokens[2].token_type, TokenType::Assign);
        assert_eq!(tokens[3].token_type, TokenType::IntegerLiteral(42));
        assert_eq!(tokens[4].token_type, TokenType::Semicolon);
    }

    #[test]
    fn test_keywords() {
        let input = "if else while for fn struct";
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        assert_eq!(tokens[0].token_type, TokenType::If);
        assert_eq!(tokens[1].token_type, TokenType::Else);
        assert_eq!(tokens[2].token_type, TokenType::While);
        assert_eq!(tokens[3].token_type, TokenType::For);
        assert_eq!(tokens[4].token_type, TokenType::Fn);
        assert_eq!(tokens[5].token_type, TokenType::Struct);
    }

    #[test]
    fn test_operators() {
        let input = "== != <= >= && || ! & | ^ ~ << >> += -= *= /= %= ->";
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        assert_eq!(tokens[0].token_type, TokenType::Equal);
        assert_eq!(tokens[1].token_type, TokenType::NotEqual);
        assert_eq!(tokens[2].token_type, TokenType::LessEqual);
        assert_eq!(tokens[3].token_type, TokenType::GreaterEqual);
        assert_eq!(tokens[4].token_type, TokenType::LogicalAnd);
        assert_eq!(tokens[5].token_type, TokenType::LogicalOr);
        assert_eq!(tokens[6].token_type, TokenType::LogicalNot);
        assert_eq!(tokens[7].token_type, TokenType::BitwiseAnd);
        assert_eq!(tokens[8].token_type, TokenType::BitwiseOr);
        assert_eq!(tokens[9].token_type, TokenType::BitwiseXor);
        assert_eq!(tokens[10].token_type, TokenType::BitwiseNot);
        assert_eq!(tokens[11].token_type, TokenType::LeftShift);
        assert_eq!(tokens[12].token_type, TokenType::RightShift);
        assert_eq!(tokens[13].token_type, TokenType::PlusAssign);
        assert_eq!(tokens[14].token_type, TokenType::MinusAssign);
        assert_eq!(tokens[15].token_type, TokenType::MultiplyAssign);
        assert_eq!(tokens[16].token_type, TokenType::DivideAssign);
        assert_eq!(tokens[17].token_type, TokenType::ModuloAssign);
        assert_eq!(tokens[18].token_type, TokenType::Arrow);
    }
}
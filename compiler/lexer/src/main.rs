use serde::{Serialize, Deserialize};
use std::env;
use std::fs;

#[allow(non_camel_case_types)]
#[derive(Serialize, Deserialize, Debug, Clone)]
enum TokenType {
    LET, VAR, CONST, FN, STRUCT, ENUM, IF, ELSE, WHILE, FOR, RETURN, IMPORT,
    PTR, REF, SELF,
    INT, FLOAT, BOOL, STRING, VOID, TRUE, FALSE,
    IDENTIFIER, INTEGER_LITERAL, FLOAT_LITERAL, STRING_LITERAL,
    PLUS, MINUS, MULTIPLY, DIVIDE, MODULO, ASSIGN, EQUAL, NOT_EQUAL,
    LESS_THAN, GREATER_THAN, LESS_EQUAL, GREATER_EQUAL,
    LOGICAL_NOT, LOGICAL_AND, LOGICAL_OR,
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE, LEFT_BRACKET, RIGHT_BRACKET,
    SEMICOLON, COMMA, DOT, COLON, ARROW, AMPERSAND, RANGE,
    EOF
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Position {
    line: usize,
    column: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Token {
    #[serde(rename = "type")]
    token_type: TokenType,
    value: String,
    position: Position,
}

struct Lexer {
    input: Vec<char>,
    pos: usize,
    line: usize,
    column: usize,
}

impl Lexer {
    fn new(input: String) -> Self {
        Lexer {
            input: input.chars().collect(),
            pos: 0,
            line: 1,
            column: 1,
        }
    }

    fn advance(&mut self) -> Option<char> {
        if self.pos >= self.input.len() {
            return None;
        }
        let ch = self.input[self.pos];
        self.pos += 1;
        if ch == '\n' {
            self.line += 1;
            self.column = 1;
        } else {
            self.column += 1;
        }
        Some(ch)
    }

    fn peek(&self) -> Option<char> {
        if self.pos >= self.input.len() {
            None
        } else {
            Some(self.input[self.pos])
        }
    }

    fn tokenize(&mut self) -> Vec<Token> {
        let mut tokens = Vec::new();
        while let Some(ch) = self.peek() {
            if ch.is_whitespace() {
                self.advance();
            } else if ch == '/' && self.pos + 1 < self.input.len() && self.input[self.pos + 1] == '/' {
                while let Some(c) = self.advance() {
                    if c == '\n' { break; }
                }
            } else if ch == '/' && self.pos + 1 < self.input.len() && self.input[self.pos + 1] == '*' {
                self.advance(); // /
                self.advance(); // *
                while let Some(c) = self.advance() {
                    if c == '*' && self.peek() == Some('/') {
                        self.advance(); // /
                        break;
                    }
                }
            } else if ch.is_alphabetic() || ch == '_' {
                tokens.push(self.read_identifier());
            } else if ch.is_numeric() || (ch == '.' && self.pos + 1 < self.input.len() && self.input[self.pos + 1].is_numeric()) {
                tokens.push(self.read_number());
            } else if ch == '"' {
                tokens.push(self.read_string());
            } else {
                if let Some(token) = self.read_punctuation_or_operator() {
                    tokens.push(token);
                } else {
                    self.advance(); // Skip unknown
                }
            }
        }
        tokens.push(Token {
            token_type: TokenType::EOF,
            value: "".to_string(),
            position: Position { line: self.line, column: self.column },
        });
        tokens
    }

    fn read_identifier(&mut self) -> Token {
        let line = self.line;
        let column = self.column;
        let mut value = String::new();
        while let Some(ch) = self.peek() {
            if ch.is_alphanumeric() || ch == '_' {
                value.push(self.advance().unwrap());
            } else { break; }
        }
        let token_type = match value.as_str() {
            "let" => TokenType::LET,
            "fn" => TokenType::FN,
            "struct" => TokenType::STRUCT,
            "if" => TokenType::IF,
            "else" => TokenType::ELSE,
            "while" => TokenType::WHILE,
            "for" => TokenType::FOR,
            "return" => TokenType::RETURN,
            "import" => TokenType::IMPORT,
            "ptr" => TokenType::PTR,
            "ref" => TokenType::REF,
            "self" => TokenType::SELF,
            "int" => TokenType::INT,
            "float" => TokenType::FLOAT,
            "string" => TokenType::STRING,
            "bool" => TokenType::BOOL,
            "true" => TokenType::TRUE,
            "false" => TokenType::FALSE,
            _ => TokenType::IDENTIFIER,
        };
        Token { token_type, value, position: Position { line, column } }
    }

    fn read_number(&mut self) -> Token {
        let line = self.line;
        let column = self.column;
        let mut value = String::new();
        let mut is_float = false;
        while let Some(ch) = self.peek() {
            if ch.is_numeric() {
                value.push(self.advance().unwrap());
            } else if ch == '.' && !is_float {
                // Check if it's a double dot range operator
                if self.pos + 1 < self.input.len() && self.input[self.pos + 1] == '.' {
                    break;
                }
                is_float = true;
                value.push(self.advance().unwrap());
            } else { break; }
        }
        Token {
            token_type: if is_float { TokenType::FLOAT_LITERAL } else { TokenType::INTEGER_LITERAL },
            value,
            position: Position { line, column },
        }
    }

    fn read_string(&mut self) -> Token {
        let line = self.line;
        let column = self.column;
        self.advance(); // Skip opening "
        let mut value = String::new();
        while let Some(ch) = self.peek() {
            if ch == '"' {
                self.advance();
                break;
            }
            if ch == '\\' {
                self.advance();
                if let Some(esc) = self.advance() {
                    match esc {
                        'n' => value.push('\n'),
                        't' => value.push('\t'),
                        'r' => value.push('\r'),
                        '\\' => value.push('\\'),
                        '\'' => value.push('\''),
                        '0' => value.push('\0'),
                        _ => value.push(esc),
                    }
                }
            } else {
                value.push(self.advance().unwrap());
            }
        }
        Token { token_type: TokenType::STRING_LITERAL, value, position: Position { line, column } }
    }

    fn read_punctuation_or_operator(&mut self) -> Option<Token> {
        let line = self.line;
        let column = self.column;
        let ch = self.advance().unwrap();
        let mut value = ch.to_string();
        
        let token_type = match ch {
            '(' => TokenType::LEFT_PAREN,
            ')' => TokenType::RIGHT_PAREN,
            '{' => TokenType::LEFT_BRACE,
            '}' => TokenType::RIGHT_BRACE,
            '[' => TokenType::LEFT_BRACKET,
            ']' => TokenType::RIGHT_BRACKET,
            ';' => TokenType::SEMICOLON,
            ',' => TokenType::COMMA,
            '.' => {
                if self.peek() == Some('.') {
                    value.push(self.advance().unwrap());
                    TokenType::RANGE
                } else { TokenType::DOT }
            },
            ':' => TokenType::COLON,
            '=' => {
                if self.peek() == Some('=') {
                    value.push(self.advance().unwrap());
                    TokenType::EQUAL
                } else { TokenType::ASSIGN }
            },
            '+' => TokenType::PLUS,
            '-' => {
                if self.peek() == Some('>') {
                    value.push(self.advance().unwrap());
                    TokenType::ARROW
                } else { TokenType::MINUS }
            },
            '*' => TokenType::MULTIPLY,
            '/' => TokenType::DIVIDE,
            '%' => TokenType::MODULO,
            '<' => {
                if self.peek() == Some('=') {
                    value.push(self.advance().unwrap());
                    TokenType::LESS_EQUAL
                } else { TokenType::LESS_THAN }
            },
            '>' => {
                if self.peek() == Some('=') {
                    value.push(self.advance().unwrap());
                    TokenType::GREATER_EQUAL
                } else { TokenType::GREATER_THAN }
            },
            '!' => {
                if self.peek() == Some('=') {
                    value.push(self.advance().unwrap());
                    TokenType::NOT_EQUAL
                } else { TokenType::LOGICAL_NOT }
            },
            '&' => {
                if self.peek() == Some('&') {
                    value.push(self.advance().unwrap());
                    TokenType::LOGICAL_AND
                } else { TokenType::AMPERSAND }
            },
            '|' => {
                if self.peek() == Some('|') {
                    value.push(self.advance().unwrap());
                    TokenType::LOGICAL_OR
                } else { return None }
            },
            _ => return None,
        };

        Some(Token { token_type, value, position: Position { line, column } })
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 { return; }
    let input = fs::read_to_string(&args[1]).expect("Failed to read file");
    let mut lexer = Lexer::new(input);
    let tokens = lexer.tokenize();
    println!("{}", serde_json::to_string(&tokens).unwrap());
}

use lexer::{Lexer, TokenType, Token};

#[cfg(test)]
mod lexer_tests {
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

    #[test]
    fn test_numbers() {
        let input = "42 3.14 0xFF 0b1010 0o755";
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        assert_eq!(tokens[0].token_type, TokenType::IntegerLiteral(42));
        assert_eq!(tokens[1].token_type, TokenType::FloatLiteral(3.14));
        assert_eq!(tokens[2].token_type, TokenType::HexLiteral(255)); // 0xFF = 255
        assert_eq!(tokens[3].token_type, TokenType::BinaryLiteral(10)); // 0b1010 = 10
        assert_eq!(tokens[4].token_type, TokenType::OctalLiteral(493)); // 0o755 = 493
    }

    #[test]
    fn test_strings() {
        let input = r#""hello" "world\"with\"quotes""#;
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        assert_eq!(tokens[0].token_type, TokenType::StringLiteral("hello".to_string()));
        assert_eq!(tokens[1].token_type, TokenType::StringLiteral("world\"with\"quotes".to_string()));
    }

    #[test]
    fn test_comments() {
        let input = "// This is a comment\nlet x = 42; /* Multi-line\ncomment */";
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        // Should only have the actual tokens, not the comments
        assert_eq!(tokens[0].token_type, TokenType::Let);
        assert_eq!(tokens[1].token_type, TokenType::Identifier("x".to_string()));
        assert_eq!(tokens[2].token_type, TokenType::Assign);
        assert_eq!(tokens[3].token_type, TokenType::IntegerLiteral(42));
        assert_eq!(tokens[4].token_type, TokenType::Semicolon);
        assert_eq!(tokens[5].token_type, TokenType::Eof);
    }

    #[test]
    fn test_eof() {
        let input = "";
        let mut lexer = Lexer::new(input);
        let tokens = lexer.tokenize().expect("Failed to tokenize");

        assert_eq!(tokens.len(), 1); // Only EOF token
        assert_eq!(tokens[0].token_type, TokenType::Eof);
    }
}
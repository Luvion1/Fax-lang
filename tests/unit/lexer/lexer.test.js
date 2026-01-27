const { Lexer } = require('../../../compiler/lexer');
const { TokenType } = require('../../../compiler/lexer/tokens/types');

describe('Lexer Unit Tests', () => {
  test('should tokenize basic keywords and identifiers', () => {
    const input = 'let x = 42; fn main() {}';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.LET);
    expect(tokens[1].value).toBe('x');
    expect(tokens[2].type).toBe(TokenType.ASSIGN);
    expect(tokens[3].value).toBe(42);
    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
  });

  test('should handle floating point numbers', () => {
    const input = 'let f = 3.14;';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    expect(tokens[3].value).toBe(3.14);
    expect(tokens[3].type).toBe(TokenType.FLOAT_LITERAL);
  });

  test('should handle strings with spaces', () => {
    const input = 'let s = "hello world";';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    expect(tokens[3].value).toBe('hello world');
  });

  test('should skip comments correctly', () => {
    const input = 'let x = 1; // this is a comment\nlet y = 2; /* multi \n line */';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    // Tokens: let, x, =, 1, ;, let, y, =, 2, ;, EOF
    expect(tokens.filter(t => t.type !== TokenType.EOF).length).toBe(10);
  });

  test('should handle multi-character operators', () => {
    const input = 'x == y; a != b; i <= 10;';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    expect(tokens.find(t => t.value === '==')).toBeDefined();
    expect(tokens.find(t => t.value === '!=')).toBeDefined();
    expect(tokens.find(t => t.value === '<=')).toBeDefined();
  });
});

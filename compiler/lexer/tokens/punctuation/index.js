const { TokenType } = require('../types');

const Punctuation = {
  '(': TokenType.LEFT_PAREN,
  ')': TokenType.RIGHT_PAREN,
  '{': TokenType.LEFT_BRACE,
  '}': TokenType.RIGHT_BRACE,
  '[': TokenType.LEFT_BRACKET,
  ']': TokenType.RIGHT_BRACKET,
  ';': TokenType.SEMICOLON,
  ',': TokenType.COMMA,
  '.': TokenType.DOT,
  ':': TokenType.COLON,
  // '::' and '->' are multi-char, might be handled in Operators or special case in Lexer?
  // Lexer handles multi-char operators, but Punctuation map in Lexer seems to only handle single chars:
  // if (Punctuation.hasOwnProperty(this.currentChar)) { ... }
  // So '::' and '->' should probably be in Operators or handled specially.
  // Looking at TokenType, they are listed under Punctuation.
  // But Lexer implementation checks Punctuation for single char, then Operators for multi-char.
  // So I will put them here if they are single char, else rely on logic?
  // Actually, Lexer implementation:
  // if (Punctuation.hasOwnProperty(this.currentChar)) { ... }
  // So single char only.
  // '::' and '->' must be handled as operators in the current Lexer logic OR I should update Lexer logic.
  // However, Lexer treats operators via `Operators` map which supports multi-char lookup.
  // So I'll put '::' and '->' in Operators for now, or ensure Lexer handles them.
  // Wait, TokenType classifies them as Punctuation.
  // Let's see Lexer logic again.
};

module.exports = { Punctuation };

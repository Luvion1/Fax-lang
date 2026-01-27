const { TokenType } = require('../types');

const Operators = {
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.MULTIPLY,
  '/': TokenType.DIVIDE,
  '%': TokenType.MODULO,
  '=': TokenType.ASSIGN,
  '==': TokenType.EQUAL,
  '!=': TokenType.NOT_EQUAL,
  '<': TokenType.LESS_THAN,
  '>': TokenType.GREATER_THAN,
  '<=': TokenType.LESS_EQUAL,
  '>=': TokenType.GREATER_EQUAL,
  '&&': TokenType.LOGICAL_AND,
  '||': TokenType.LOGICAL_OR,
  '!': TokenType.LOGICAL_NOT,
  '&': TokenType.BITWISE_AND,
  '|': TokenType.BITWISE_OR,
  '^': TokenType.BITWISE_XOR,
  '~': TokenType.BITWISE_NOT,
  '<<': TokenType.LEFT_SHIFT,
  '>>': TokenType.RIGHT_SHIFT,
  '+=': TokenType.PLUS_ASSIGN,
  '-=': TokenType.MINUS_ASSIGN,
  '*=': TokenType.MULTIPLY_ASSIGN,
  '/=': TokenType.DIVIDE_ASSIGN,
  '%=': TokenType.MODULO_ASSIGN,
  
  // Punctuation that are multi-char or treated as operators in lexing logic
  '::': TokenType.DOUBLE_COLON,
  '->': TokenType.ARROW
};

module.exports = { Operators };

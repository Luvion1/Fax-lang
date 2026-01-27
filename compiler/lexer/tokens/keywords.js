/**
 * Keywords for Fax-lang lexer
 */

const { TokenType } = require('./types');

const Keywords = {
  'let': TokenType.LET,
  'var': TokenType.VAR,
  'const': TokenType.CONST,
  'fn': TokenType.FN,
  'struct': TokenType.STRUCT,
  'enum': TokenType.ENUM,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'while': TokenType.WHILE,
  'for': TokenType.FOR,
  'return': TokenType.RETURN,
  'pub': TokenType.PUB,
  'priv': TokenType.PRIV,
  'static': TokenType.STATIC,
  'int': TokenType.INT,
  'float': TokenType.FLOAT,
  'bool': TokenType.BOOL,
  'string': TokenType.STRING,
  'char': TokenType.CHAR,
  'void': TokenType.VOID,
  'true': TokenType.TRUE,
  'false': TokenType.FALSE
};

module.exports = { Keywords };
export const TokenType = {
  // Literals
  Identifier: "Identifier",
  String: "String",
  Number: "Number",
  Char: "Char",

  // Keywords
  Let: "Let",
  Mut: "Mut",
  Shadow: "Shadow",
  Const: "Const",
  Static: "Static",
  Fn: "Fn",
  Main: "Main",
  Type: "Type",
  Struct: "Struct",
  Impl: "Impl",
  Enum: "Enum",
  StateMachine: "StateMachine", // Unique Fax-lang
  Data: "Data",
  State: "State",
  Any: "Any",
  Yield: "Yield",
  Gen: "Gen",
  Async: "Async",
  Await: "Await",
  If: "If",
  Else: "Else",
  ElseIf: "ElseIf",
  Match: "Match",
  Loop: "Loop",
  While: "While",
  For: "For",
  Break: "Break",
  Continue: "Continue",
  Return: "Return",
  Trait: "Trait",
  Dyn: "Dyn",
  Where: "Where",
  Use: "Use",
  Pub: "Pub",
  Mod: "Mod",

  // Symbols
  LeftParen: "LeftParen",
  RightParen: "RightParen",
  LeftBrace: "LeftBrace",
  RightBrace: "RightBrace",
  LeftBracket: "LeftBracket",
  RightBracket: "RightBracket",
  Comma: "Comma",
  Dot: "Dot",
  DoubleDot: "DoubleDot",
  TripleDot: "TripleDot",
  DotEqual: "DotEqual",
  Semicolon: "Semicolon",
  Colon: "Colon",
  DoubleColon: "DoubleColon",
  Arrow: "Arrow",
  FatArrow: "FatArrow",

  // Operators
  Equal: "Equal",
  EqualEqual: "EqualEqual",
  Bang: "Bang",
  BangEqual: "BangEqual",
  Plus: "Plus",
  PlusEqual: "PlusEqual",
  Minus: "Minus",
  MinusEqual: "MinusEqual",
  Star: "Star",
  StarEqual: "StarEqual",
  Slash: "Slash",
  SlashEqual: "SlashEqual",
  Percent: "Percent",
  Less: "Less",
  LessEqual: "LessEqual",
  Greater: "Greater",
  GreaterEqual: "GreaterEqual",
  Ampersand: "Ampersand",
  Pipe: "Pipe",
  And: "And",
  Or: "Or",

  // Special
  EOF: "EOF",
  Illegal: "Illegal"
} as const;

export type TokenType = typeof TokenType[keyof typeof TokenType];

export interface Token {
  type: TokenType;
  literal: string;
  line: number;
  column: number;
}
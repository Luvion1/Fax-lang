// Kita pakai gaya JS: Tipe node cuma string, sisanya dynamic property
export const NodeType = {
  Program: "Program",
  
  // Statements
  LetStatement: "LetStatement",
  FunctionDeclaration: "FunctionDeclaration",
  ReturnStatement: "ReturnStatement",
  ExpressionStatement: "ExpressionStatement",
  BlockStatement: "BlockStatement",
  
  // Fax-lang Unique
  StateMachine: "StateMachine",
  StateDefinition: "StateDefinition",
  StateTransition: "StateTransition", // fn inside state

  // Expressions
  Identifier: "Identifier",
  IntegerLiteral: "IntegerLiteral",
  PrefixExpression: "PrefixExpression",
  InfixExpression: "InfixExpression",
  CallExpression: "CallExpression"
} as const;

// "Tipe JS" - fleksibel, tidak perlu interface rumit
export type ASTNode = {
  type: string;
  token?: any; // Simpan token asli untuk debugging
  [key: string]: any; // Allow any extra properties (Gaya JS)
};

const { Lexer } = require('../../../compiler/lexer');
const { Parser } = require('../../../compiler/parser');

describe('Parser Unit Tests', () => {
  const parse = (input) => {
    const tokens = new Lexer(input).tokenize();
    return new Parser(tokens).parse();
  };

  test('should parse struct declarations', () => {
    const input = 'struct User { id: int, name: string }';
    const ast = parse(input);
    expect(ast.body[0].type).toBe('StructDeclaration');
    expect(ast.body[0].name).toBe('User');
    expect(ast.body[0].fields.length).toBe(2);
  });

  test('should parse for loops', () => {
    const input = 'for (let i = 0; i < 10; i = i + 1) { println(i); }';
    const ast = parse(input);
    expect(ast.body[0].type).toBe('ForStatement');
    expect(ast.body[0].init.type).toBe('VariableDeclaration');
    expect(ast.body[0].test.type).toBe('BinaryExpression');
  });

  test('should parse complex binary expressions with precedence', () => {
    const input = 'let x = 1 + 2 * 3;';
    const ast = parse(input);
    const init = ast.body[0].initializer;
    // 1 + (2 * 3)
    expect(init.operator).toBe('+');
    expect(init.right.operator).toBe('*');
  });

  test('should parse array indexing and member access', () => {
    const input = 'let x = users[0].id;';
    const ast = parse(input);
    const init = ast.body[0].initializer;
    expect(init.type).toBe('MemberExpression');
    expect(init.object.type).toBe('IndexExpression');
  });

  test('should parse function calls with multiple arguments', () => {
    const input = 'add(1, 2, 3);';
    const ast = parse(input);
    expect(ast.body[0].expression.type).toBe('CallExpression');
    expect(ast.body[0].expression.arguments.length).toBe(3);
  });
});

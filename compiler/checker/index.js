class SymbolTable {
  constructor(parent = null) {
    this.symbols = new Map();
    this.parent = parent;
  }

  define(name, type) {
    this.symbols.set(name, type);
  }

  lookup(name) {
    if (this.symbols.has(name)) {
      return this.symbols.get(name);
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    return null;
  }
}

class Checker {
  constructor(ast) {
    this.ast = ast;
    this.globals = new SymbolTable();
    this.currentScope = this.globals;
    this.structs = new Map();

    // Define built-ins
    this.globals.define('println', { kind: 'function', returnType: 'void' });
  }

  check() {
    this.visit(this.ast);
    return true;
  }

  visit(node) {
    if (!node) return null;

    switch (node.type) {
      case 'Program':
        for (const stmt of node.body) {
          this.visit(stmt);
        }
        break;
      
      case 'StructDeclaration':
        this.structs.set(node.name, node.fields);
        this.globals.define(node.name, 'type');
        break;

      case 'FunctionDeclaration':
        this.globals.define(node.name, {
          kind: 'function',
          returnType: node.returnType,
          params: node.params
        });
        
        const fnScope = new SymbolTable(this.globals);
        this.currentScope = fnScope;
        for (const param of node.params) {
          this.currentScope.define(param.name, param.type);
        }
        this.visit(node.body);
        this.currentScope = this.globals;
        break;

      case 'VariableDeclaration':
        const initType = this.visit(node.initializer);
        if (node.dataType && initType && node.dataType !== 'auto' && node.dataType !== initType) {
           // Allow some flexibility for now or throw warning
           console.warn(`Warning: Type mismatch for ${node.identifier}. Declared ${node.dataType}, got ${initType}`);
        }
        this.currentScope.define(node.identifier, node.dataType || initType || 'auto');
        break;

      case 'BlockStatement':
        const oldScope = this.currentScope;
        this.currentScope = new SymbolTable(oldScope);
        for (const stmt of node.body) {
          this.visit(stmt);
        }
        this.currentScope = oldScope;
        break;

      case 'ExpressionStatement':
        this.visit(node.expression);
        break;

      case 'AssignmentExpression':
        const leftType = this.visit(node.left);
        const rightType = this.visit(node.right);
        // Basic check
        if (leftType && rightType && leftType !== rightType && leftType !== 'auto' && rightType !== 'auto') {
           console.warn(`Warning: Assignment type mismatch. Left side is ${leftType}, right side is ${rightType}`);
        }
        return leftType;

      case 'BinaryExpression':
        const lType = this.visit(node.left);
        const rType = this.visit(node.right);
        // Logic for binary ops type promotion could go here
        return lType || rType;

      case 'MemberExpression':
        const objType = this.visit(node.object);
        const structFields = this.structs.get(objType);
        if (structFields) {
          const field = structFields.find(f => f.name === node.property);
          if (field) return field.type;
        }
        return 'auto';

      case 'CallExpression':
        const callee = this.visit(node.callee);
        if (callee && callee.kind === 'function') {
          return callee.returnType;
        }
        return 'auto';

      case 'Identifier':
        const type = this.currentScope.lookup(node.name);
        if (!type) {
          // Check if it's a struct name
          if (this.structs.has(node.name)) return node.name;
          console.warn(`Warning: Undefined identifier ${node.name}`);
        }
        return type;

      case 'Literal':
        if (typeof node.value === 'number') {
          return Number.isInteger(node.value) ? 'int' : 'float';
        }
        if (typeof node.value === 'string') return 'string';
        if (typeof node.value === 'boolean') return 'bool';
        return 'auto';

      case 'ReturnStatement':
        return this.visit(node.argument);

      case 'IfStatement':
        this.visit(node.test);
        this.visit(node.consequent);
        if (node.alternate) this.visit(node.alternate);
        break;

      case 'WhileStatement':
        this.visit(node.test);
        this.visit(node.body);
        break;
    }
    return null;
  }
}

module.exports = { Checker };
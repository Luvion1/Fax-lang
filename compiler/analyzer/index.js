class Analyzer {
  constructor(ast) {
    this.ast = ast;
    this.ownership = new Map(); // variable -> state (owned, moved)
  }

  analyze() {
    this.visit(this.ast);
    return true;
  }

  visit(node) {
    if (!node) return;

    switch (node.type) {
      case 'Program':
        for (const stmt of node.body) {
          this.visit(stmt);
        }
        break;

      case 'FunctionDeclaration':
        const oldOwnership = new Map(this.ownership);
        // Parameters are owned by the function
        for (const param of node.params) {
          this.ownership.set(param.name, 'owned');
        }
        this.visit(node.body);
        this.ownership = oldOwnership; // Restore after function
        break;

      case 'VariableDeclaration':
        this.visit(node.initializer);
        this.ownership.set(node.identifier, 'owned');
        break;

      case 'BlockStatement':
        for (const stmt of node.body) {
          this.visit(stmt);
        }
        break;

      case 'ExpressionStatement':
        this.visit(node.expression);
        break;

      case 'AssignmentExpression':
        this.visit(node.right);
        this.visit(node.left);
        // If assigned, it's now owned (re-initialized)
        if (node.left.type === 'Identifier') {
          this.ownership.set(node.left.name, 'owned');
        }
        break;

      case 'Identifier':
        if (this.ownership.get(node.name) === 'moved') {
          console.error(`Safety Error: Use of moved value '${node.name}'`);
          // In a real compiler, we would throw here to stop compilation
        }
        break;

      case 'CallExpression':
        this.visit(node.callee);
        for (const arg of node.arguments) {
          if (arg.type === 'Identifier') {
            const state = this.ownership.get(arg.name);
            if (state === 'moved') {
               console.error(`Safety Error: Passing moved value '${arg.name}' to function`);
            }
            // Simple move semantics: passing to function moves it
            // (In a more advanced version, we'd check if it's a borrow)
            // For now, let's just simulate it for strings or structs
            // this.ownership.set(arg.name, 'moved');
          } else {
            this.visit(arg);
          }
        }
        break;

      case 'IfStatement':
        this.visit(node.test);
        this.visit(node.consequent);
        if (node.alternate) this.visit(node.alternate);
        break;

      case 'WhileStatement':
        this.visit(node.test);
        this.visit(node.body);
        break;
        
      case 'ReturnStatement':
        this.visit(node.argument);
        break;

      case 'BinaryExpression':
        this.visit(node.left);
        this.visit(node.right);
        break;

      case 'MemberExpression':
        this.visit(node.object);
        break;
    }
  }
}

module.exports = { Analyzer };
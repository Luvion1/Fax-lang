import { NodeType } from "../parser/ast/nodes.ts";
import type { ASTNode } from "../parser/ast/nodes.ts";
import { LLVMModule } from "../llvm/module.ts";
import { LLVMBuilder } from "../llvm/builder.ts";
import type { LLVMType } from "../llvm/types.ts";

export class CodeGenerator {
  private module: LLVMModule;
  private builder: LLVMBuilder;
  private symbols: Map<string, string> = new Map();
  private isInsideFunction = false;

  constructor(fileName: string) {
    this.module = new LLVMModule(fileName);
    this.builder = new LLVMBuilder();
  }

  generate(ast: ASTNode): string {
    const mainStatements: ASTNode[] = [];
    let hasUserMain = false;
    
    for (const stmt of ast.statements) {
      if (stmt.type === NodeType.FunctionDeclaration) {
        if (stmt.name.value === "main") hasUserMain = true;
        this.generateFunction(stmt);
      } else if (stmt.type === NodeType.StateMachine) {
        this.generateStateMachine(stmt);
      } else {
        mainStatements.push(stmt);
      }
    }

    // Generate @main ONLY if there are top-level statements OR no user main
    if (mainStatements.length > 0 || !hasUserMain) {
        this.builder = new LLVMBuilder();
        this.isInsideFunction = true;
        this.builder.emitLabel("entry");
        for (const stmt of mainStatements) {
          this.visitStatement(stmt);
        }
        this.builder.createRet("0", "i32");
        this.module.addFunctionDefinition(`define i32 @main() {\n${this.builder.build()}\n}`);
    }
    
    return this.module.toString();
  }

  private generateFunction(fn: ASTNode) {
    const oldBuilder = this.builder;
    const oldSymbols = new Map(this.symbols);
    
    this.builder = new LLVMBuilder();
    this.isInsideFunction = true;
    this.symbols.clear();

    const fnName = fn.name.value;
    const paramList = fn.params.map((p: any) => `i32 %${p.value}`).join(", ");

    this.builder.emitLabel("entry");
    for (const p of fn.params) {
        const ptr = this.builder.createAlloca("i32");
        this.builder.createStore(`%${p.value}`, ptr, "i32");
        this.symbols.set(p.value, ptr);
    }

    this.visitBlock(fn.body);
    
    // Ensure return
    this.builder.createRet("0", "i32");

    this.module.addFunctionDefinition(`define i32 @${fnName}(${paramList}) {\n${this.builder.build()}\n}`);

    this.builder = oldBuilder;
    this.symbols = oldSymbols;
    this.isInsideFunction = false;
  }

  private generateStateMachine(sm: ASTNode) {
    this.module.addFunctionDeclaration(`SM_${sm.name.value}_Init`, "void", []);
    
    sm.states.forEach((state: any) => {
        state.transitions.forEach((t: any) => {
            const transName = `SM_${sm.name.value}_${state.name.value}_${t.name}`;
            const oldBuilder = this.builder;
            const oldSymbols = new Map(this.symbols);
            
            this.builder = new LLVMBuilder();
            this.isInsideFunction = true;
            this.symbols.clear();

            // Handle transition parameters
            const paramList = (t.params || []).map((p: any) => `i32 %${p.value}`).join(", ");
            this.builder.emitLabel("entry");
            this.builder.emitRaw(`; Transition from ${state.name.value} to ${t.target || "SameState"}`);

            if (t.params) {
                for (const p of t.params) {
                    const ptr = this.builder.createAlloca("i32");
                    this.builder.createStore(`%${p.value}`, ptr, "i32");
                    this.symbols.set(p.value, ptr);
                }
            }

            this.visitBlock(t.body);
            this.builder.createRet("0", "i32");
            this.module.addFunctionDefinition(`define i32 @${transName}(${paramList}) {\n${this.builder.build()}\n}`);

            this.builder = oldBuilder;
            this.symbols = oldSymbols;
            this.isInsideFunction = false;
        });
    });
  }

  private visitStatement(stmt: ASTNode) {
    if (!stmt) return;
    switch (stmt.type) {
      case NodeType.LetStatement: this.visitLetStatement(stmt); break;
      case "ShadowStatement": this.visitShadowStatement(stmt); break;
      case "ConstStatement": this.visitConstStatement(stmt); break;
      case NodeType.ReturnStatement: this.visitReturnStatement(stmt); break;
      case NodeType.ExpressionStatement: this.visitExpression(stmt.expression); break;
      case NodeType.BlockStatement: this.visitBlock(stmt); break;
      case "WhileStatement": this.visitWhileStatement(stmt); break;
    }
  }

  private visitWhileStatement(stmt: ASTNode) {
    const condL = this.builder.newLabel("while.cond");
    const bodyL = this.builder.newLabel("while.body");
    const endL = this.builder.newLabel("while.end");

    this.builder.createBr(condL);
    this.builder.emitLabel(condL);
    const cond = this.visitExpression(stmt.condition);
    this.builder.createCondBr(cond, bodyL, endL);

    this.builder.emitLabel(bodyL);
    this.visitBlock(stmt.body);
    this.builder.createBr(condL);

    this.builder.emitLabel(endL);
  }

  private visitLetStatement(stmt: ASTNode) {
    const val = this.visitExpression(stmt.value);
    const ptr = this.builder.createAlloca("i32");
    this.symbols.set(stmt.name.value, ptr);
    this.builder.createStore(val, ptr, "i32");
  }

  private visitShadowStatement(stmt: ASTNode) {
    const sourceVar = stmt.value.value;
    const originalPtr = this.symbols.get(sourceVar);
    if (!originalPtr) throw new Error(`Cannot shadow undefined variable: ${sourceVar}`);
    this.symbols.set(stmt.name.value, originalPtr);
    this.builder.emitRaw(`; Shadow: '${stmt.name.value}' points to '${sourceVar}'`);
  }

  private visitConstStatement(stmt: ASTNode) {
      const val = this.visitExpression(stmt.value);
      this.symbols.set(stmt.name.value, val);
  }

  private visitReturnStatement(stmt: ASTNode) {
    const val = this.visitExpression(stmt.returnValue);
    this.builder.createRet(val, "i32");
  }

  private visitExpression(expr: ASTNode): string {
    if (!expr) return "0";
    switch (expr.type) {
      case NodeType.IntegerLiteral: return expr.value.toString();
      case NodeType.Identifier:
        const entry = this.symbols.get(expr.value);
        if (entry === undefined) {
            // Check if it's a global constant or similar (fallback to literal 0 if not found)
            return "0"; 
        }
        if (!isNaN(Number(entry))) return entry; // Constant
        return this.builder.createLoad(entry, "i32");
      case NodeType.CallExpression: return this.visitCallExpression(expr);
      case NodeType.InfixExpression: return this.visitInfixExpression(expr);
      case "IfExpression": return this.visitIfExpression(expr);
      case "AssignmentExpression": return this.visitAssignmentExpression(expr);
      default: return "0";
    }
  }

  private visitCallExpression(expr: ASTNode): string {
      const fnName = expr.function.value;
      const args = expr.arguments.map((a: any) => ({
          type: "i32" as const,
          val: this.visitExpression(a)
      }));
      return this.builder.createCall(fnName, args, "i32");
  }

  private visitAssignmentExpression(expr: ASTNode): string {
      const varName = expr.name.value;
      const ptr = this.symbols.get(varName);
      if (!ptr) throw new Error(`Cannot assign to undefined variable: ${varName}`);
      
      const val = this.visitExpression(expr.value);
      this.builder.createStore(val, ptr, "i32");
      return val;
  }

  private visitInfixExpression(expr: ASTNode): string {
    const l = this.visitExpression(expr.left);
    const r = this.visitExpression(expr.right);
    switch (expr.operator) {
      case '+': return this.builder.createBinOp("add", "i32", l, r);
      case '-': return this.builder.createBinOp("sub", "i32", l, r);
      case '*': return this.builder.createBinOp("mul", "i32", l, r);
      case '/': return this.builder.createBinOp("sdiv", "i32", l, r);
      case '>': return this.builder.createICmp("sgt", "i32", l, r);
      case '<': return this.builder.createICmp("slt", "i32", l, r);
      case '==': return this.builder.createICmp("eq", "i32", l, r);
      case '!=': return this.builder.createICmp("ne", "i32", l, r);
      case '&&': return this.builder.createBinOp("and", "i1", l, r);
      case '||': return this.builder.createBinOp("or", "i1", l, r);
      default: return "0";
    }
  }

  private visitIfExpression(expr: ASTNode): string {
    const resPtr = this.builder.createAlloca("i32");
    const cond = this.visitExpression(expr.condition);
    const thenL = this.builder.newLabel("if.then");
    const elseL = this.builder.newLabel("if.else");
    const mergeL = this.builder.newLabel("if.merge");
    this.builder.createCondBr(cond, thenL, elseL);

    this.builder.emitLabel(thenL);
    const thenV = this.visitBlock(expr.consequence);
    this.builder.createStore(thenV || "0", resPtr, "i32");
    this.builder.createBr(mergeL);

    this.builder.emitLabel(elseL);
    if (expr.alternative) {
        const elseV = (expr.alternative.type === "IfExpression") 
            ? this.visitIfExpression(expr.alternative) 
            : this.visitBlock(expr.alternative);
        this.builder.createStore(elseV || "0", resPtr, "i32");
    } else {
        this.builder.createStore("0", resPtr, "i32");
    }
    this.builder.createBr(mergeL);

    this.builder.emitLabel(mergeL);
    return this.builder.createLoad(resPtr, "i32");
  }

  private visitBlock(block: ASTNode): string | null {
      let last = null;
      if (!block || !block.statements) return null;
      for (const s of block.statements) {
          if (s.type === NodeType.ExpressionStatement) last = this.visitExpression(s.expression);
          else this.visitStatement(s);
      }
      return last;
  }
}
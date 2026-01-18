import { NodeType } from "../../parser/ast/nodes.js";
import type { ASTNode } from "../../parser/ast/nodes.js";
import { Arm64Emitter } from "./arm64.js";
import { ElfGenerator } from "./elf.js";

export class NativeCodegen {
  private emitter: Arm64Emitter;
  
  // Register Allocator Sederhana (MVP)
  // Kita simpan nilai variabel di Map sementara.
  // Di real implementation, ini harus mapping ke Register CPU.
  private varValues: Map<string, number> = new Map();

  constructor() {
    this.emitter = new Arm64Emitter();
  }

  generate(ast: ASTNode): Buffer {
    // 1. Traverse AST
    for (const stmt of ast.statements) {
        this.visitStatement(stmt);
    }

    // 2. Add Exit Syscall (Safety net)
    // Jika user lupa return, kita paksa exit 0
    // MOV X0, #0
    this.emitter.emitMovX0(0);
    // MOV X8, #93 (Exit)
    this.emitter.emitMovX8(93);
    // SVC #0
    this.emitter.emitSvc0();

    // 3. Wrap in ELF
    const machineCode = this.emitter.getCode();
    return ElfGenerator.generate(machineCode);
  }

  private visitStatement(stmt: ASTNode) {
    switch (stmt.type) {
        case NodeType.LetStatement:
            // Constant folding sederhana untuk performa
            // let x = 10; -> Simpan 10 di map compiler (compile-time execution)
            if (stmt.value.type === NodeType.IntegerLiteral) {
                this.varValues.set(stmt.name.value, stmt.value.value);
            } else if (stmt.value.type === NodeType.InfixExpression) {
                // Pre-calculate constant math expression
                // Ini optimasi level C++ (Constant Folding)
                const val = this.evaluateConstantExpr(stmt.value);
                this.varValues.set(stmt.name.value, val);
            }
            break;

        case NodeType.ReturnStatement:
            // return x;
            // 1. Load value ke X0 (Return Register)
            const val = this.evaluateExpression(stmt.returnValue);
            this.emitter.emitMovX0(val);
            
            // 2. Syscall Exit (di Linux native, return main = exit syscall)
            this.emitter.emitMovX8(93); // syscall exit
            this.emitter.emitSvc0();
            break;
    }
  }

  // Optimasi: Hitung nilai di waktu kompilasi jika memungkinkan
  private evaluateExpression(expr: ASTNode): number {
    if (expr.type === NodeType.IntegerLiteral) {
        return expr.value;
    } else if (expr.type === NodeType.Identifier) {
        const val = this.varValues.get(expr.value);
        if (val === undefined) throw new Error(`Variable ${expr.value} not found or not constant`);
        return val;
    } else if (expr.type === NodeType.InfixExpression) {
        return this.evaluateConstantExpr(expr);
    }
    return 0;
  }

  private evaluateConstantExpr(expr: ASTNode): number {
      const left = this.evaluateExpression(expr.left);
      const right = this.evaluateExpression(expr.right);
      
      switch(expr.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return Math.floor(left / right);
          default: return 0;
      }
  }
}

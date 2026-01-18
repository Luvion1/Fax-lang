import { Opcode, ICmpCond } from './types.ts';
import type { LLVMType, LLVMValue } from './types.ts';

export class LLVMBuilder {
  private buffer: string[] = [];
  private registerCounter = 0;
  
  constructor() {
    this.registerCounter = 0;
  }

  newRegister(): string {
    return `%${this.registerCounter++}`;
  }

  newLabel(prefix: string = 'block'): string {
    return `${prefix}${this.registerCounter++}`;
  }

  emitRaw(instr: string) {
    this.buffer.push(`  ${instr}`);
  }

  emitLabel(label: string) {
    this.buffer.push(`${label}:`);
  }

  createBinOp(op: Opcode, type: LLVMType, lhs: string, rhs: string): string {
    const dest = this.newRegister();
    // OPTIMISASI GILA: 'nsw' (No Signed Wrap)
    // Memberitahu LLVM bahwa overflow tidak mungkin terjadi (Undefined Behavior).
    // Ini mengizinkan LLVM melakukan loop unrolling & vektorisasi agresif.
    const flags = (op === 'add' || op === 'sub' || op === 'mul') ? 'nsw' : '';
    
    this.emitRaw(`${dest} = ${op} ${flags} ${type} ${lhs}, ${rhs}`);
    return dest;
  }

  createAlloca(type: LLVMType): string {
    const dest = this.newRegister();
    // LLVM 14 syntax
    const ptrType = type === 'i32' ? 'i32*' : type + '*';
    this.emitRaw(`${dest} = alloca ${type}, align 4`);
    return dest;
  }

  createStore(val: string, ptr: string, type: LLVMType) {
    const ptrType = type === 'i32' ? 'i32*' : type + '*';
    this.emitRaw(`store ${type} ${val}, ${ptrType} ${ptr}, align 4`);
  }

  createLoad(ptr: string, type: LLVMType): string {
    const dest = this.newRegister();
    const ptrType = type === 'i32' ? 'i32*' : type + '*';
    this.emitRaw(`${dest} = load ${type}, ${ptrType} ${ptr}, align 4`);
    return dest;
  }

  createRet(val: string, type: LLVMType) {
    this.emitRaw(`ret ${type} ${val}`);
  }
  
  createRetVoid() {
    this.emitRaw(`ret void`);
  }

  createCall(fnName: string, args: { type: LLVMType, val: string }[], retType: LLVMType): string {
    const argStr = args.map(a => `${a.type} ${a.val}`).join(', ');
    
    if (retType === 'void') {
      this.emitRaw(`call void @${fnName}(${argStr})`);
      return '';
    } else {
      const dest = this.newRegister();
      this.emitRaw(`${dest} = call ${retType} @${fnName}(${argStr})`);
      return dest;
    }
  }

  // %res = icmp eq i32 %1, %2
  createICmp(cond: ICmpCond, type: LLVMType, lhs: string, rhs: string): string {
    const dest = this.newRegister();
    this.emitRaw(`${dest} = icmp ${cond} ${type} ${lhs}, ${rhs}`);
    return dest;
  }

  // br i1 %cond, label %then, label %else
  createCondBr(cond: string, thenLabel: string, elseLabel: string) {
    this.emitRaw(`br i1 ${cond}, label %${thenLabel}, label %${elseLabel}`);
  }

  // br label %target
  createBr(target: string) {
    this.emitRaw(`br label %${target}`);
  }

  build(): string {
    return this.buffer.join('\n');
  }
}
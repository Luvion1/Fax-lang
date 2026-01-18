// Definisi Tipe Primitif LLVM
export type LLVMType = 
  | 'void' 
  | 'i1'      // boolean
  | 'i8'      // byte/char
  | 'i32'     // int
  | 'i64'     // long
  | 'double'  // float64
  | 'i32*';   // pointer (explisit i32*)

// Struktur untuk Function Signature
export interface LLVMFunctionType {
  returnType: LLVMType;
  paramTypes: LLVMType[];
}

// Representasi Value di LLVM (bisa berupa register %1 atau literal 5)
export interface LLVMValue {
  type: LLVMType;
  value: string; // "%1", "@global_var", "42"
}

// Opcodes Dasar LLVM
export const Opcode = {
  // Arithmetic
  Add: 'add',
  Sub: 'sub',
  Mul: 'mul',
  SDiv: 'sdiv', // Signed division
  UDiv: 'udiv', // Unsigned division

  // Memory
  Alloca: 'alloca',
  Load: 'load',
  Store: 'store',

  // Control Flow
  Ret: 'ret',
  Br: 'br',
  Call: 'call',
  ICmp: 'icmp'
} as const;

export type Opcode = typeof Opcode[keyof typeof Opcode];

// Kondisi untuk perbandingan (icmp)
export const ICmpCond = {
  Eq: 'eq',  // equal
  Ne: 'ne',  // not equal
  Sgt: 'sgt', // signed greater than
  Slt: 'slt', // signed less than
} as const;

import type { LLVMType, LLVMValue } from './types.ts';

export class LLVMModule {
  private name: string;
  private declarations: string[] = [];
  private definitions: string[] = [];
  private stringConstants: Map<string, string> = new Map(); // "text" -> "@.str.1"
  private stringCounter = 0;

  constructor(name: string) {
    this.name = name;
  }

  // Mendaftarkan string literal global (untuk printf dll)
  // Mengembalikan referensi pointer: @.str.X
  addStringConstant(value: string): string {
    if (this.stringConstants.has(value)) {
      return this.stringConstants.get(value)!;
    }

    const id = `@.str.${this.stringCounter++}`;
    this.stringConstants.set(value, id);
    return id;
  }

  addFunctionDeclaration(name: string, retType: LLVMType, params: LLVMType[]) {
    const paramStr = params.join(', ');
    this.declarations.push(`declare ${retType} @${name}(${paramStr})`);
  }

  // Menambahkan definisi fungsi lengkap
  // OPTIMISASI: Tambahkan atribut #0 (nounwind)
  addFunctionDefinition(definition: string) {
    // Sisipkan atribut sebelum kurung kurawal pembuka
    const optimizedDef = definition.replace('{', '#0 {');
    this.definitions.push(optimizedDef);
  }

  // Menghasilkan output .ll lengkap
  toString(): string {
    const header = `; ModuleID = '${this.name}'\nsource_filename = "${this.name}.fx"
`;
    
    // Generate String Constants
    let constants = "";
    for (const [val, id] of this.stringConstants) {
      const len = val.length + 1; 
      // Note: We need literal \00 in output, so we escape backslash here
      constants += `${id} = private unnamed_addr constant [${len} x i8] c"${val}\\00", align 1\n`;
    }

    const decls = this.declarations.join('\n');
    const defs = this.definitions.join('\n\n');
    
    // Attribute Group #0: nounwind (No Exception Handling overhead)
    const attrs = `\nattributes #0 = { nounwind }`;

    return `${header}\n${constants}\n${decls}\n\n${defs}\n${attrs}`;
  }
}
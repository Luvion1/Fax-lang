// Konstanta ELF64 untuk Linux ARM64 (AArch64)

export const ELF_HEADER_SIZE = 0x40; // 64 bytes
export const PROGRAM_HEADER_SIZE = 0x38; // 56 bytes
export const BASE_ADDRESS = 0x400000; // Alamat memori standar load program

// Helper untuk menulis integer ke buffer (Little Endian)
export function writeU8(buf: Buffer, val: number, offset: number) {
  buf.writeUInt8(val, offset);
}

export function writeU16(buf: Buffer, val: number, offset: number) {
  buf.writeUInt16LE(val, offset);
}

export function writeU32(buf: Buffer, val: number, offset: number) {
  buf.writeUInt32LE(val, offset);
}

export function writeU64(buf: Buffer, val: bigint, offset: number) {
  buf.writeBigUInt64LE(val, offset);
}

export class ElfGenerator {
  // Membuat buffer ELF Header + Program Header + Code
  static generate(code: Buffer): Buffer {
    const fileSize = ELF_HEADER_SIZE + PROGRAM_HEADER_SIZE + code.length;
    const buf = Buffer.alloc(fileSize);

    // --- 1. ELF Header (64 bytes) ---
    
    // e_ident[EI_MAG0..3] = 0x7F 'E' 'L' 'F'
    writeU8(buf, 0x7F, 0);
    writeU8(buf, 0x45, 1); // 'E'
    writeU8(buf, 0x4C, 2); // 'L'
    writeU8(buf, 0x46, 3); // 'F'

    writeU8(buf, 2, 4);    // EI_CLASS = 2 (64-bit)
    writeU8(buf, 1, 5);    // EI_DATA = 1 (Little Endian)
    writeU8(buf, 1, 6);    // EI_VERSION = 1
    writeU8(buf, 0, 7);    // EI_OSABI = 0 (System V)
    writeU8(buf, 0, 8);    // EI_ABIVERSION = 0
    // Padding 9-15 kosong

    writeU16(buf, 2, 16);  // e_type = 2 (ET_EXEC - Executable file)
    writeU16(buf, 183, 18); // e_machine = 183 (EM_AARCH64)
    writeU32(buf, 1, 20);  // e_version = 1
    
    // e_entry: Entry point address (Virtual Address dimana kode dimulai)
    // Header (64) + Phdr (56) = 120 bytes offset. Base = 0x400000
    // Entry = 0x400000 + 120 = 0x400078
    const entryPoint = BigInt(BASE_ADDRESS + ELF_HEADER_SIZE + PROGRAM_HEADER_SIZE);
    writeU64(buf, entryPoint, 24);

    writeU64(buf, BigInt(ELF_HEADER_SIZE), 32); // e_phoff: Program header offset (setelah ELF header)
    writeU64(buf, BigInt(0), 40);  // e_shoff: Section header offset (tidak pakai section header dulu)
    writeU32(buf, 0, 48);          // e_flags
    writeU16(buf, ELF_HEADER_SIZE, 52); // e_ehsize: Size of this header (64)
    writeU16(buf, PROGRAM_HEADER_SIZE, 54); // e_phentsize: Size of program header entry (56)
    writeU16(buf, 1, 56);          // e_phnum: Number of program headers (1 segment saja)
    writeU16(buf, 0, 58);          // e_shentsize
    writeU16(buf, 0, 60);          // e_shnum
    writeU16(buf, 0, 62);          // e_shstrndx

    // --- 2. Program Header (56 bytes) ---
    const phOffset = ELF_HEADER_SIZE;

    writeU32(buf, 1, phOffset + 0); // p_type = 1 (PT_LOAD)
    writeU32(buf, 7, phOffset + 4); // p_flags = 7 (RWX - Read Write Execute)
    
    writeU64(buf, BigInt(0), phOffset + 8); // p_offset: Offset in file where segment starts (0 = start of file)
    writeU64(buf, BigInt(BASE_ADDRESS), phOffset + 16); // p_vaddr: Virtual address to load into
    writeU64(buf, BigInt(BASE_ADDRESS), phOffset + 24); // p_paddr: Physical address
    
    const totalSize = BigInt(fileSize);
    writeU64(buf, totalSize, phOffset + 32); // p_filesz: Size in file
    writeU64(buf, totalSize, phOffset + 40); // p_memsz: Size in memory
    writeU64(buf, BigInt(0x1000), phOffset + 48); // p_align: Alignment (4KB page)

    // --- 3. Machine Code ---
    // Copy kode assembler yang di-generate ke buffer
    const codeOffset = ELF_HEADER_SIZE + PROGRAM_HEADER_SIZE;
    code.copy(buf, codeOffset);

    return buf;
  }
}

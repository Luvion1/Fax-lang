// ARM64 Instruction Emitter

// Helper untuk menulis instruksi 32-bit (Little Endian)
function instr(val: number): Buffer {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(val, 0);
    return buf;
}

export class Arm64Emitter {
    private buffer: Buffer[] = [];

    // SVC #0 (Supervisor Call) -> D4000001
    emitSvc0() {
        this.buffer.push(instr(0xD4000001));
    }

    // MOV Xd, #imm16 (Move Wide Immediate)
    // 32-bit Instruction:
    // [31]=1 (sf=64bit), [30-29]=10 (op=MOV), [28-23]=100101 (S=0, hw=0), [22-21]=imm16_hw, [20-5]=imm16, [4-0]=Xd
    // Simple Opcode base for MOVZ Xd, #imm, LSL #0: 0xD2800000
    emitMovX0(imm: number) {
        // MOV X0, #imm
        // X0 = register 0
        // Base: 0xD2800000
        // Imm mask: bits 5-20
        // Reg mask: bits 0-4
        
        if (imm > 65535) {
            throw new Error("MVP only supports 16-bit integers for now");
        }
        
        const opcode = (0xD2800000 | (imm << 5) | 0) >>> 0;
        this.buffer.push(instr(opcode));
    }

    emitMovX8(imm: number) {
        // MOV X8, #imm
        // X8 = register 8
        if (imm > 65535) {
            throw new Error("MVP only supports 16-bit integers for now");
        }

        const opcode = (0xD2800000 | (imm << 5) | 8) >>> 0;
        this.buffer.push(instr(opcode));
    }

    getCode(): Buffer {
        return Buffer.concat(this.buffer);
    }
}

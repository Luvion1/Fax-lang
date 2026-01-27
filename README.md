# 📠 Fax-lang: The Industrial C++ Guard

**Fax-lang** is a high-performance programming language designed as a safety layer for C++. It is an **aggressive type checker** that transpiles code into 100% safe, efficient, and corporate-standard C++.

## 🛡️ Zero-Runtime Safety
Fax guarantees memory safety at compile-time using a **Static Lifetime Tracking** and **Borrow Checking** system. 
- **No Garbage Collector (GC)**
- **No Virtual Machine (VM)**
- **Zero Overhead**
- **Leak-Free Guarantee** via RAII patterns.

## 🏗️ Polyglot Architecture
Fax-lang utilizes a modular architecture where each phase is powered by the most suitable technology:
- **Lexer**: Written in **Rust** for high-speed tokenization.
- **Parser**: Written in **TypeScript** for robust grammar handling.
- **Checker/Analyzer**: Written in **Rust** for memory-safe semantic analysis.
- **Transpiler**: Written in **Python** for elegant C++ code generation.

## 🚀 Getting Started

### Installation
Ensure you have the following toolchains installed:
- Node.js (v18+)
- Rust (Cargo)
- Python 3
- G++ (for compiling the output)

```bash
# Install dependencies
npm install
# Link binaries (provides 'faxc' and 'fax' commands)
npm link
```

### Usage

#### 1. Compile and Check Errors
Use `faxc` to analyze your code and generate C++.
```bash
faxc examples/demo.fax
```

#### 2. Run Program Instantly
Use `fax run` to compile and execute your Fax program in one step.
```bash
fax run examples/demo.fax
```

#### 3. Deep-dive into Errors
If you encounter a specific error code (e.g., `E0382`), use the explain feature:
```bash
faxc --explain E0382
```

## 📁 Project Structure
```
fax-lang/
├── compiler/          # Multi-language compiler modules
├── src/               # Standard library (Fax)
├── examples/          # Example Fax programs
├── tests/             # Comprehensive unit & integration tests
├── docs/              # Detailed documentation
└── ARCHITECTURE.md    # Modular design documentation
```

## 📚 Documentation
For more details, see [ARCHITECTURE.md](ARCHITECTURE.md) or explore the `docs/` directory.

---
*"C++ performance. Absolute safety. Total control."*

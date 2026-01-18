<p align="center">
  <img src="assets/logo.svg" width="180" height="180" />
</p>

<h1 align="center">Fax-lang</h1>

<p align="center">
  <strong>A Modern Systems Programming Language with Life-Force Memory Management</strong>
</p>

<p align="center">
  <a href="https://github.com/Luvion1/Fax-lang/actions"><img src="https://github.com/Luvion1/Fax-lang/workflows/CI/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/Luvion1/Fax-lang/actions"><img src="https://github.com/Luvion1/Fax-lang/workflows/Deploy%20Docs/badge.svg" alt="Docs Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

---

## 🦊 What is Fax-lang?

Fax-lang is a high-performance systems programming language built on top of LLVM. It introduces a revolutionary approach to memory safety called **Life-Force Tracking**, allowing for deterministic memory management without the overhead of a Garbage Collector or the complexity of a traditional Borrow Checker.

## ✨ Core Pillars

### 1. Life-Force Memory System (Rule 2)
Every variable is born with "energy" that decays through usage.
- **Read**: -0.02 | **Write**: -0.08
- When life-force reaches zero, the variable is automatically reclaimed. This ensures memory safety through a deterministic, usage-based lifecycle.

### 2. Contractual State Machines (Rule 4)
State machines are first-class citizens. Transitions are verified at compile-time to prevent illegal states.
```fax
state_machine Connection {
    state Closed {
        fn connect() -> Connecting { ... }
    }
}
```

### 3. Shadow & Mirroring (Rule 1)
Manage data access via **Shadows** (read-only views) that lazily create **Mirrors** only for modified segments, optimizing cache locality and performance.

### 4. Unified Memory Space (Rule 3)
The compiler automatically analyzes access patterns to decide whether data should reside on the **Stack**, **Heap**, or a **Hybrid** of both.

---

## 🛠 Getting Started

### Prerequisites
- **Node.js** (v18 or newer)
- **LLVM** (llc & clang v14/18)

### Installation
```bash
git clone https://github.com/Luvion1/Fax-lang.git
cd Fax-lang
npm install
```

---

## 🚀 Usage

### Compiling Programs
```bash
# Build a binary from a .fx file
npm run dev build examples/mvp.fx

# Execute the output
./examples/mvp
```

### AST Visualization
```bash
npm run dev ast examples/mvp.fx
```

---

## 📖 Documentation
The official documentation is built with **mdBook** and is available in the `docs/` directory.

To serve documentation locally:
```bash
cd docs
mdbook serve --open
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an Issue to discuss potential changes.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Luvion1">Luvion1</a>
</p>

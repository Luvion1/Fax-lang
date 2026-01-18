# <img src="assets/logo.svg" width="64" height="64" align="center" /> Fax-lang

**The Fax Programming Language Reference Implementation**

Fax is a systems programming language designed for extreme memory safety and deterministic state transitions through its unique **Life-Force** and **Contractual State Machine** systems.

## 🚀 Key Features

- **Life-Force Memory Management**: Probabilistic but deterministic cleanup without GC or traditional borrow checking.
- **Contractual State Machines**: Compile-time verified state transitions.
- **Shadow & Mirroring**: Granular, page-based differential copying.
- **Unified Memory Space**: Automated placement (Stack/Heap/Hybrid) optimized for access patterns.

## 🛠 Installation

```bash
git clone https://github.com/Luvion1/Fax-lang.git
cd Fax-lang
npm install
```

## 💻 Usage

Compile a `.fx` file:
```bash
npm run dev build examples/mvp.fx
```

View the AST of a file:
```bash
npm run dev ast examples/mvp.fx
```

## 📚 Documentation

The official documentation is located in the `docs/` folder and is built using **mdBook**.

View online: [GitHub Pages Link] (Automatic deployment via GitHub Actions)

To view locally:
```bash
cd docs
mdbook serve --open
```

## 🧪 Testing

```bash
npm test
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

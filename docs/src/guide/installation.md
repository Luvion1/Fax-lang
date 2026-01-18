# Installation & Building

## Prerequisites

To build the Fax-lang compiler, you need:

- **Node.js** (v18 or newer)
- **TypeScript** and **ts-node**
- **LLVM 14 or 18** (specifically `llc` and `clang`)

## Building the Compiler

1. Clone the repository:
   ```bash
   git clone https://github.com/Luvion1/Fax-lang.git
   cd Fax-lang
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the compiler:
   ```bash
   npm run build
   ```

## Compiling Fax Programs

You can run the compiler directly using `ts-node`:

```bash
npm run dev build your_file.fx
```

## Documentation (mdBook)

The documentation is built using [mdBook](https://github.com/rust-lang/mdBook).

To install mdBook:
```bash
cargo install mdbook
```

To serve the documentation locally:
```bash
cd docs
mdbook serve --open
```

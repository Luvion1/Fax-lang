# Installation & Building

## Prerequisites

To build and run the Fax-lang compiler, you will need the following tools:

- **Node.js** (v18 or newer)
- **TypeScript** & **ts-node**
- **LLVM Toolchain** (Specifically `llc` and `clang`, version 14 or 18)

## Setting Up the Compiler

1. Clone the repository:
   ```bash
   git clone https://github.com/Luvion1/Fax-lang.git
   cd Fax-lang
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Build the compiler:
   ```bash
   npm run build
   ```

## Compiling Your First Program

You can compile Fax source files (`.fx`) using the provided dev script:

```bash
npm run dev build your_file.fx
```

## Building the Documentation

The documentation is built using [mdBook](https://github.com/rust-lang/mdBook).

1. Install mdBook:
   ```bash
   cargo install mdbook
   ```

2. Serve the documentation locally:
   ```bash
   cd book
   mdbook serve --open
   ```
#!/usr/bin/env -S node --loader ts-node/esm --no-warnings

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execSync } from 'node:child_process';
import { Lexer } from './modules/lexer/index.js';
import { Parser } from './modules/parser/index.js';
import { CodeGenerator } from './modules/codegen/index.js';
import { SemanticChecker } from './modules/analysis/checker.js';

function findTool(names: string[]): string | null {
  for (const name of names) {
    try {
      const res = spawnSync(name, ['--version'], { stdio: 'ignore' });
      if (res.status === 0) return name;
    } catch (e) { continue; }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (args.length < 2 || (command !== 'ast' && command !== 'build')) {
    console.log("Fax-lang Compiler v0.0.1");
    console.log("Usage: fax build <file.fx>");
    process.exit(1);
  }

  const file = args[1];
  // SECURITY: Prevent Path Traversal by resolving and validating path
  const filePath = path.resolve(process.cwd(), file);
  const projectRoot = process.cwd();

  if (!filePath.startsWith(projectRoot)) {
      console.error(`Error: Access denied to path: ${filePath}`);
      process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(filePath, 'utf-8');
  const baseName = path.basename(file, '.fx');
  const outputDir = path.dirname(filePath);
  const outputBin = path.join(outputDir, baseName);

  try {
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const ast = parser.parseProgram();

    if (parser.errors.length > 0) {
        parser.errors.forEach(err => console.error(err));
        process.exit(1);
    }

    if (command === 'ast') {
        console.log(JSON.stringify(ast, (k, v) => (k === 'token' ? undefined : v), 2));
        return;
    }

    const checker = new SemanticChecker();
    checker.check(ast);

    console.log(`\n[Fax] Compiling ${file}...`);
    const codegen = new CodeGenerator(baseName);
    const llvmIR = codegen.generate(ast);
    
    const tempLl = path.join(outputDir, `.${baseName}.tmp.ll`);
    const tempObj = path.join(outputDir, `.${baseName}.tmp.o`);
    fs.writeFileSync(tempLl, llvmIR);

    const llcBin = findTool(['llc-18', 'llc-14', 'llc']);
    const clangBin = findTool(['clang-18', 'clang-14', 'clang']);

    if (llcBin && clangBin) {
        // ... build process ...
        const llc = spawnSync(llcBin, ['-O3', '-filetype=obj', '-relocation-model=pic', '-o', tempObj, tempLl], { stdio: 'inherit' });
        if (llc.status !== 0) throw new Error("llc failed");

        const clang = spawnSync(clangBin, ['-O3', '-fuse-ld=lld', '-o', outputBin, tempObj], { stdio: 'inherit' });
        if (clang.status !== 0) throw new Error("clang failed");

        fs.unlinkSync(tempLl);
        fs.unlinkSync(tempObj);
        console.log(`✅ Build Successful: ${outputBin}`);
    } else {
        console.log("⚠️ Toolchain missing, IR saved.");
    }

  } catch (error: any) {
    const { ErrorReporter } = await import('./shared/logger/error-reporter.js');
    ErrorReporter.report(error, source, file);
    process.exit(1);
  }
}

main();
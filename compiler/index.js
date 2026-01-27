// Fax-lang Compiler Entry Point
// Orchestrates the entire compilation pipeline

const lexer = require('./compiler/lexer');
const parser = require('./compiler/parser');
const checker = require('./compiler/checker');
const analyzer = require('./compiler/analyzer');
const transpiler = require('./compiler/transpiler');

class FaxCompiler {
  constructor(options = {}) {
    this.options = options;
  }

  async compile(sourceCode) {
    try {
      // Step 1: Tokenization
      const tokens = await lexer.tokenize(sourceCode);
      
      // Step 2: Parsing
      const ast = await parser.parse(tokens);
      
      // Step 3: Static Checking
      await checker.check(ast);
      
      // Step 4: Deep Analysis
      await analyzer.analyze(ast);
      
      // Step 5: Transpilation to C++
      const cppCode = await transpiler.transpile(ast);
      
      return cppCode;
    } catch (error) {
      throw new Error(`Compilation failed: ${error.message}`);
    }
  }
}

module.exports = FaxCompiler;
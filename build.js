#!/usr/bin/env node

/**
 * Build Script for Fax-lang Compiler
 * 
 * This script orchestrates the build process for the entire Fax-lang compiler.
 */

const BuildSystem = require('./utils/build-system');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildScript {
  constructor() {
    this.buildSystem = new BuildSystem('./build.config.js');
    this.args = process.argv.slice(2);
  }

  async run() {
    if (this.args.length === 0) {
      console.log('Usage: node build.js [command]');
      console.log('Commands:');
      console.log('  build-all     Build all compiler modules');
      console.log('  build-module <module>  Build specific module (lexer, parser, checker, analyzer, transpiler)');
      console.log('  test [type]   Run tests (unit, integration, all)');
      console.log('  lint [lang]   Run linting (rust, go, typescript, javascript, python, all)');
      console.log('  format [lang] Run formatting (rust, typescript, javascript, python, all)');
      console.log('  clean         Clean build artifacts');
      console.log('  help          Show this help');
      process.exit(1);
    }

    const command = this.args[0];
    const arg = this.args[1];

    try {
      switch (command) {
        case 'build-all':
          await this.buildAll();
          break;
          
        case 'build-module':
          if (!arg) {
            console.error('Error: Module name required for build-module command');
            process.exit(1);
          }
          await this.buildModule(arg);
          break;
          
        case 'test':
          await this.runTests(arg || 'unit');
          break;
          
        case 'lint':
          await this.runLint(arg || 'all');
          break;
          
        case 'format':
          await this.runFormat(arg || 'all');
          break;
          
        case 'clean':
          await this.clean();
          break;
          
        case 'help':
          this.showHelp();
          break;
          
        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error(`Build failed: ${error.message}`);
      process.exit(1);
    }
  }

  async buildAll() {
    console.log('Building all modules...');
    await this.buildSystem.buildCompiler();
    console.log('All modules built successfully!');
  }

  async buildModule(moduleName) {
    const validModules = ['lexer', 'parser', 'checker', 'analyzer', 'transpiler'];
    if (!validModules.includes(moduleName)) {
      console.error(`Invalid module: ${moduleName}. Valid modules: ${validModules.join(', ')}`);
      process.exit(1);
    }

    console.log(`Building module: ${moduleName}`);
    
    const moduleConfig = this.buildSystem.config.modules[moduleName];
    if (!moduleConfig) {
      console.error(`Module ${moduleName} not found in configuration`);
      process.exit(1);
    }

    try {
      const { stdout, stderr } = await exec(moduleConfig.buildCommand, {
        cwd: moduleConfig.path
      });
      
      console.log(`Module ${moduleName} built successfully`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`Failed to build module ${moduleName}: ${error.message}`);
      process.exit(1);
    }
  }

  async runTests(testType) {
    if (testType === 'all') {
      await this.buildSystem.runTests('unit');
      await this.buildSystem.runTests('integration');
    } else {
      await this.buildSystem.runTests(testType);
    }
  }

  async runLint(lang) {
    if (lang === 'all') {
      for (const language of ['rust', 'go', 'typescript', 'javascript', 'python']) {
        try {
          await this.buildSystem.runLint(language);
        } catch (error) {
          console.error(`Linting failed for ${language}: ${error.message}`);
          // Continue with other languages
        }
      }
    } else {
      await this.buildSystem.runLint(lang);
    }
  }

  async runFormat(lang) {
    if (lang === 'all') {
      for (const language of ['rust', 'typescript', 'javascript', 'python']) {
        try {
          await this.buildSystem.runFormat(language);
        } catch (error) {
          console.error(`Formatting failed for ${language}: ${error.message}`);
          // Continue with other languages
        }
      }
    } else {
      await this.buildSystem.runFormat(lang);
    }
  }

  async clean() {
    await this.buildSystem.clean();
  }

  showHelp() {
    console.log('Usage: node build.js [command]');
    console.log('Commands:');
    console.log('  build-all     Build all compiler modules');
    console.log('  build-module <module>  Build specific module (lexer, parser, checker, analyzer, transpiler)');
    console.log('  test [type]   Run tests (unit, integration, all)');
    console.log('  lint [lang]   Run linting (rust, go, typescript, javascript, python, all)');
    console.log('  format [lang] Run formatting (rust, typescript, javascript, python, all)');
    console.log('  clean         Clean build artifacts');
    console.log('  help          Show this help');
  }
}

// Run the build script
const buildScript = new BuildScript();
buildScript.run();
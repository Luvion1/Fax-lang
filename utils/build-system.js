/**
 * Advanced Build System for Fax-lang Compiler
 * 
 * This module provides a sophisticated build system that can handle
 * multiple languages, dependencies, and build configurations.
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BuildError extends Error {
  constructor(message, code = 'BUILD_ERROR') {
    super(message);
    this.code = code;
    this.name = 'BuildError';
  }
}

class BuildSystem {
  constructor(configPath = './build.config.js') {
    this.config = this.loadConfig(configPath);
    this.targets = new Map();
    this.dependencies = new Map();
    this.buildCache = new Map();
    this.artifacts = [];
  }

  /**
   * Load build configuration
   */
  loadConfig(configPath) {
    try {
      // Try to load the config file
      if (fs.existsSync(configPath)) {
        return require(path.resolve(configPath));
      } else {
        // Return default config if file doesn't exist
        return this.getDefaultConfig();
      }
    } catch (error) {
      console.warn(`Could not load build config from ${configPath}, using defaults:`, error.message);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default build configuration
   */
  getDefaultConfig() {
    return {
      modules: {
        lexer: {
          language: 'rust',
          path: './compiler/lexer',
          executable: 'lexer',
          buildCommand: 'cargo build --release',
          output: './target/release/lexer'
        },
        parser: {
          language: 'typescript',
          path: './compiler/parser',
          executable: 'parser',
          buildCommand: 'npm run build',
          output: './dist/index.js'
        },
        checker: {
          language: 'go',
          path: './compiler/checker',
          executable: 'checker',
          buildCommand: 'go build -o checker main.go',
          output: './checker'
        },
        analyzer: {
          language: 'rust',
          path: './compiler/analyzer',
          executable: 'analyzer',
          buildCommand: 'cargo build --release',
          output: './target/release/analyzer'
        },
        transpiler: {
          language: 'python',
          path: './compiler/transpiler',
          executable: 'transpiler',
          buildCommand: 'python -m py_compile main.py', // Just verify syntax
          output: './main.py'
        }
      },
      build: {
        outputDir: './build',
        target: 'cpp',
        optimizationLevel: 'O2',
        debug: false
      },
      test: {
        unit: {
          rust: 'cargo test',
          go: 'go test ./...',
          typescript: 'npm run test',
          javascript: 'jest'
        },
        integration: {
          command: 'npm run integration-test'
        }
      },
      lint: {
        rust: 'cargo clippy',
        go: 'golint ./...',
        typescript: 'eslint src/',
        javascript: 'eslint src/',
        format: {
          rust: 'cargo fmt',
          typescript: 'prettier --write src/',
          javascript: 'prettier --write src/'
        }
      }
    };
  }

  /**
   * Register a build target
   */
  addTarget(name, config) {
    this.targets.set(name, {
      name,
      ...config,
      dependencies: config.dependencies || [],
      buildSteps: config.buildSteps || []
    });
  }

  /**
   * Add a dependency relationship
   */
  addDependency(target, dependency) {
    if (!this.dependencies.has(target)) {
      this.dependencies.set(target, new Set());
    }
    this.dependencies.get(target).add(dependency);
  }

  /**
   * Check if a target needs to be rebuilt
   */
  needsRebuild(targetName) {
    const target = this.targets.get(targetName);
    if (!target) {
      throw new BuildError(`Target ${targetName} not found`);
    }

    // Check if output exists and is newer than inputs
    if (target.output && fs.existsSync(target.output)) {
      const outputStat = fs.statSync(target.output);
      const outputTime = outputStat.mtime;

      // Check all input files
      for (const input of target.inputs || []) {
        if (!fs.existsSync(input)) {
          return true; // Input doesn't exist, needs rebuild
        }

        const inputStat = fs.statSync(input);
        if (inputStat.mtime > outputTime) {
          return true; // Input is newer than output, needs rebuild
        }
      }

      return false; // Output is up to date
    }

    return true; // Output doesn't exist, needs rebuild
  }

  /**
   * Build a specific target
   */
  async buildTarget(targetName) {
    const target = this.targets.get(targetName);
    if (!target) {
      throw new BuildError(`Target ${targetName} not found`);
    }

    console.log(`Building target: ${targetName}`);

    // Check dependencies first
    for (const dep of target.dependencies) {
      await this.buildTarget(dep);
    }

    // Check if rebuild is needed
    if (!this.needsRebuild(targetName)) {
      console.log(`Target ${targetName} is up to date, skipping...`);
      return;
    }

    // Execute build steps
    for (const step of target.buildSteps) {
      await this.executeBuildStep(step, target);
    }

    // Cache the build result
    this.buildCache.set(targetName, Date.now());
    console.log(`Successfully built target: ${targetName}`);
  }

  /**
   * Execute a single build step
   */
  async executeBuildStep(step, target) {
    console.log(`Executing build step: ${step.command || step.action}`);

    if (step.command) {
      // Execute shell command
      const { stdout, stderr } = await execAsync(step.command, {
        cwd: step.cwd || target.path || process.cwd(),
        env: { ...process.env, ...(step.env || {}) }
      });

      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } else if (step.action && typeof step.action === 'function') {
      // Execute custom function
      await step.action(target);
    } else {
      throw new BuildError(`Invalid build step: ${JSON.stringify(step)}`);
    }
  }

  /**
   * Build all targets
   */
  async buildAll() {
    console.log('Starting full build...');

    for (const [targetName] of this.targets) {
      await this.buildTarget(targetName);
    }

    console.log('Full build completed!');
  }

  /**
   * Clean build artifacts
   */
  async clean() {
    console.log('Cleaning build artifacts...');

    // Remove build directory
    if (fs.existsSync(this.config.build.outputDir)) {
      fs.rmSync(this.config.build.outputDir, { recursive: true, force: true });
    }

    // Clean each module's build artifacts
    for (const [moduleName, moduleConfig] of Object.entries(this.config.modules)) {
      const outputPath = path.resolve(moduleConfig.output);
      const outputDir = path.dirname(outputPath);
      
      // Remove the output file/directory if it exists
      if (fs.existsSync(outputPath)) {
        if (fs.lstatSync(outputPath).isDirectory()) {
          fs.rmSync(outputPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(outputPath);
        }
      }
    }

    // Clear cache
    this.buildCache.clear();
    this.artifacts = [];

    console.log('Clean completed!');
  }

  /**
   * Run tests
   */
  async runTests(testType = 'unit') {
    console.log(`Running ${testType} tests...`);

    const testConfig = this.config.test[testType];
    if (!testConfig) {
      throw new BuildError(`Unknown test type: ${testType}`);
    }

    if (typeof testConfig === 'string') {
      // Single command for all languages
      const { stdout, stderr } = await execAsync(testConfig);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } else if (typeof testConfig === 'object') {
      // Separate commands for different languages
      for (const [lang, cmd] of Object.entries(testConfig)) {
        console.log(`Running ${testType} tests for ${lang}...`);
        try {
          const { stdout, stderr } = await execAsync(cmd);
          console.log(stdout);
          if (stderr) console.error(stderr);
        } catch (error) {
          console.error(`Tests failed for ${lang}:`, error.message);
          throw error;
        }
      }
    }

    console.log(`${testType} tests completed!`);
  }

  /**
   * Run linting
   */
  async runLint(lang = null) {
    console.log(`Running linting${lang ? ` for ${lang}` : ''}...`);

    if (lang) {
      // Lint specific language
      const cmd = this.config.lint[lang];
      if (!cmd) {
        throw new BuildError(`Unknown language for linting: ${lang}`);
      }

      const { stdout, stderr } = await execAsync(cmd);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } else {
      // Lint all languages
      for (const [lang, cmd] of Object.entries(this.config.lint)) {
        if (typeof cmd === 'string') {
          console.log(`Linting ${lang}...`);
          try {
            const { stdout, stderr } = await execAsync(cmd);
            console.log(stdout);
            if (stderr) console.error(stderr);
          } catch (error) {
            console.error(`Linting failed for ${lang}:`, error.message);
          }
        }
      }
    }

    console.log('Linting completed!');
  }

  /**
   * Run formatting
   */
  async runFormat(lang = null) {
    console.log(`Running formatting${lang ? ` for ${lang}` : ' for all languages'}...`);

    if (lang) {
      // Format specific language
      const formatCmds = this.config.lint.format;
      const cmd = formatCmds[lang];
      if (!cmd) {
        throw new BuildError(`Unknown language for formatting: ${lang}`);
      }

      const { stdout, stderr } = await execAsync(cmd);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } else {
      // Format all languages
      const formatCmds = this.config.lint.format;
      for (const [lang, cmd] of Object.entries(formatCmds)) {
        console.log(`Formatting ${lang}...`);
        try {
          const { stdout, stderr } = await execAsync(cmd);
          console.log(stdout);
          if (stderr) console.error(stderr);
        } catch (error) {
          console.error(`Formatting failed for ${lang}:`, error.message);
        }
      }
    }

    console.log('Formatting completed!');
  }

  /**
   * Build the entire compiler
   */
  async buildCompiler() {
    console.log('Building Fax-lang compiler...');

    // Build each module
    for (const [moduleName, moduleConfig] of Object.entries(this.config.modules)) {
      console.log(`Building module: ${moduleName}`);
      
      try {
        const { stdout, stderr } = await execAsync(moduleConfig.buildCommand, {
          cwd: moduleConfig.path
        });
        
        console.log(`Built ${moduleName} successfully`);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error(`Failed to build ${moduleName}:`, error.message);
        throw error;
      }
    }

    console.log('Compiler build completed!');
  }
}

module.exports = BuildSystem;
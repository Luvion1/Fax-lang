/**
 * Advanced Build Configuration for Fax-lang Compiler
 * 
 * This configuration defines how to build the various components
 * of the Fax-lang compiler.
 */

module.exports = {
  // Module-specific build configurations
  modules: {
    lexer: {
      language: 'rust',
      path: './compiler/lexer',
      executable: 'lexer',
      buildCommand: 'cargo build --release',
      output: './target/release/lexer',
      dependencies: [],
      testCommand: 'cargo test',
      lintCommand: 'cargo clippy && cargo fmt --check'
    },
    parser: {
      language: 'typescript',
      path: './compiler/parser',
      executable: 'parser',
      buildCommand: 'npm run build',
      output: './dist/index.js',
      dependencies: [],
      testCommand: 'npm run test',
      lintCommand: 'npm run lint'
    },
    checker: {
      language: 'go',
      path: './compiler/checker',
      executable: 'checker',
      buildCommand: 'go build -o checker main.go',
      output: './checker',
      dependencies: [],
      testCommand: 'go test ./...',
      lintCommand: 'golint *.go'
    },
    analyzer: {
      language: 'rust',
      path: './compiler/analyzer',
      executable: 'analyzer',
      buildCommand: 'cargo build --release',
      output: './target/release/analyzer',
      dependencies: [],
      testCommand: 'cargo test',
      lintCommand: 'cargo clippy && cargo fmt --check'
    },
    transpiler: {
      language: 'python',
      path: './compiler/transpiler',
      executable: 'transpiler',
      buildCommand: 'python -m py_compile main.py', // Just verify syntax
      output: './main.py',
      dependencies: [],
      testCommand: 'python -m pytest tests/',
      lintCommand: 'pylint main.py && black --check main.py'
    }
  },

  // Overall build settings
  build: {
    outputDir: './build',
    target: 'cpp',
    optimizationLevel: 'O2',
    debug: false,
    incremental: true, // Enable incremental builds
    cacheDir: './.build-cache' // Directory for build caching
  },

  // Testing configuration
  test: {
    unit: {
      rust: 'cargo test --workspace',
      go: 'go test ./...',
      typescript: 'npm run test',
      javascript: 'jest tests/unit/',
      python: 'python -m pytest tests/unit/'
    },
    integration: {
      command: 'npm run integration-test'
    },
    coverage: {
      enabled: true,
      threshold: 80, // Minimum coverage percentage
      outputDir: './coverage'
    }
  },

  // Linting and formatting configuration
  lint: {
    rust: {
      command: 'cargo clippy',
      configFile: './compiler/lexer/clippy.toml,./compiler/analyzer/clippy.toml'
    },
    go: {
      command: 'golint ./...',
      configFile: './compiler/checker/.golangci.yml'
    },
    typescript: {
      command: 'eslint src/ --ext .ts,.js',
      configFile: './compiler/parser/.eslintrc.json'
    },
    javascript: {
      command: 'eslint src/ --ext .js',
      configFile: './.eslintrc.json'
    },
    python: {
      command: 'pylint *.py',
      configFile: './compiler/transpiler/.pylintrc'
    },
    format: {
      rust: 'cargo fmt',
      typescript: 'prettier --write src/',
      javascript: 'prettier --write src/',
      python: 'black *.py'
    }
  },

  // Release configuration
  release: {
    version: '0.1.0',
    tagName: 'v0.1.0',
    publish: {
      enabled: false,
      registry: 'https://registry.npmjs.org/'
    },
    artifacts: [
      './build/fax-compiler-linux',
      './build/fax-compiler-mac',
      './build/fax-compiler-windows.exe'
    ]
  },

  // Deployment configuration
  deploy: {
    targets: {
      staging: {
        host: 'staging.example.com',
        path: '/opt/fax-lang',
        user: 'deploy'
      },
      production: {
        host: 'prod.example.com',
        path: '/opt/fax-lang',
        user: 'deploy'
      }
    }
  }
};
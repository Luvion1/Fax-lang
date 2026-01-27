# Multi-stage Dockerfile for Fax-lang compiler

# Build stage for Rust components
FROM rust:1.70 AS rust-builder

WORKDIR /usr/src
COPY compiler/lexer ./lexer
COPY compiler/analyzer ./analyzer

RUN cd lexer && cargo build --release
RUN cd analyzer && cargo build --release

# Build stage for Go component
FROM golang:1.21 AS go-builder

WORKDIR /usr/src
COPY compiler/checker ./checker

RUN cd checker && go build -o checker main.go

# Build stage for Node.js/TypeScript component
FROM node:18 AS node-builder

WORKDIR /usr/src
COPY compiler/parser ./parser
COPY package*.json ./

RUN npm ci
RUN cd parser && npm ci && npm run build

# Final stage
FROM ubuntu:22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy built binaries from previous stages
COPY --from=rust-builder /usr/src/lexer/target/release/lexer /usr/local/bin/
COPY --from=rust-builder /usr/src/analyzer/target/release/analyzer /usr/local/bin/
COPY --from=go-builder /usr/src/checker/checker /usr/local/bin/
COPY --from=node-builder /usr/src/parser/dist /usr/local/lib/fax-parser/

# Copy remaining components
COPY compiler/transpiler/main.py /usr/local/lib/fax-transpiler/
COPY compiler/main.js /usr/local/bin/fax-compiler
COPY utils/ /usr/local/lib/fax-utils/
COPY build.config.js /usr/local/etc/

# Create a non-root user
RUN groupadd -r faxuser && useradd -r -g faxuser faxuser
USER faxuser

# Set up entrypoint
ENTRYPOINT ["/usr/local/bin/node", "/usr/local/bin/fax-compiler"]
CMD ["--help"]
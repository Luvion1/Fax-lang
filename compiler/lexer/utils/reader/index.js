class SourceReader {
  constructor(sourceCode) {
    this.sourceCode = sourceCode;
    this.position = 0;
    this.length = sourceCode.length;
  }

  getCurrentChar() {
    if (this.position >= this.length) {
      return null;
    }
    return this.sourceCode[this.position];
  }

  advance() {
    this.position++;
  }

  peek(lookahead = 1) {
    const targetPos = this.position + lookahead;
    if (targetPos >= this.length) {
      return null;
    }
    return this.sourceCode[targetPos];
  }
}

module.exports = { SourceReader };

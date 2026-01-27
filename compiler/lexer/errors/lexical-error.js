class LexicalError extends Error {
  constructor(message, positionTracker) {
    super(message);
    this.name = 'LexicalError';
    const pos = positionTracker.getPosition();
    this.line = pos.line;
    this.column = pos.column;
    this.message = `${message} at line ${this.line}, column ${this.column}`;
  }
}

module.exports = { LexicalError };

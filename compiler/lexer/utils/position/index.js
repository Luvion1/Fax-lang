class PositionTracker {
  constructor() {
    this.line = 1;
    this.column = 1;
  }

  nextLine() {
    this.line++;
    this.column = 1;
  }

  incrementColumn() {
    this.column++;
  }

  getPosition() {
    return {
      line: this.line,
      column: this.column
    };
  }
}

module.exports = { PositionTracker };

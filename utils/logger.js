/**
 * Logging System for Fax-lang Compiler
 * 
 * This module provides a centralized logging system for all compiler modules.
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// Log format
class LogEntry {
  constructor(level, module, message, timestamp = new Date()) {
    this.level = level;
    this.module = module;
    this.message = message;
    this.timestamp = timestamp;
  }

  toString() {
    return `[${this.timestamp.toISOString()}] [${this.level}] [${this.module}] ${this.message}`;
  }
}

class Logger {
  constructor(moduleName, logLevel = LogLevel.INFO, logFile = null) {
    this.moduleName = moduleName;
    this.logLevel = logLevel;
    this.logFile = logFile;
    this.enabled = true;
  }

  log(level, message) {
    if (!this.enabled || level < this.logLevel) {
      return;
    }

    const logEntry = new LogEntry(level, this.moduleName, message);
    const logMessage = logEntry.toString();

    // Output to console
    this.outputToConsole(level, logMessage);

    // Output to file if specified
    if (this.logFile) {
      this.outputToFile(logMessage);
    }
  }

  outputToConsole(level, message) {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.FATAL:
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }

  outputToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  debug(message) {
    this.log(LogLevel.DEBUG, message);
  }

  info(message) {
    this.log(LogLevel.INFO, message);
  }

  warn(message) {
    this.log(LogLevel.WARN, message);
  }

  error(message) {
    this.log(LogLevel.ERROR, message);
  }

  fatal(message) {
    this.log(LogLevel.FATAL, message);
  }
}

// Global logger manager
class LogManager {
  constructor() {
    this.loggers = new Map();
    this.defaultLogLevel = LogLevel.INFO;
    this.defaultLogFile = null;
  }

  getLogger(moduleName, logLevel = this.defaultLogLevel, logFile = this.defaultLogFile) {
    if (!this.loggers.has(moduleName)) {
      const logger = new Logger(moduleName, logLevel, logFile);
      this.loggers.set(moduleName, logger);
    }
    
    return this.loggers.get(moduleName);
  }

  setGlobalLogLevel(level) {
    this.defaultLogLevel = level;
    // Update all existing loggers
    for (const logger of this.loggers.values()) {
      logger.logLevel = level;
    }
  }

  setGlobalLogFile(filePath) {
    this.defaultLogFile = filePath;
    // Update all existing loggers
    for (const logger of this.loggers.values()) {
      logger.logFile = filePath;
    }
  }
}

// Create global log manager instance
const logManager = new LogManager();

module.exports = {
  LogLevel,
  Logger,
  LogEntry,
  logManager
};
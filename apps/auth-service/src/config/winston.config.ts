import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Winston Logger Configuration
 *
 * This configuration sets up structured logging for the Auth service.
 * It uses Winston with daily rotating file logs and console output.
 *
 * Features:
 * - JSON formatting for log files (machine-readable)
 * - Colorized console output for development (human-readable)
 * - Daily log rotation to prevent disk space issues
 * - Separate error logs and combined logs
 * - Configurable log level via LOG_LEVEL environment variable
 * - Stack trace capture for errors
 * - Exception and rejection handlers for unhandled errors
 *
 * Log Levels (from most to least verbose):
 * - error: Error events that might still allow the app to continue
 * - warn: Warning events
 * - info: Informational messages (default)
 * - debug: Debug messages with detailed information
 *
 * @constant winstonConfig
 */
export const winstonConfig: WinstonModuleOptions = {
  // Log level: defaults to 'info' if not specified in environment
  // Can be overridden with LOG_LEVEL environment variable
  level: process.env.LOG_LEVEL || 'info',

  // Log format: combine timestamp, error stack traces, and JSON formatting
  format: winston.format.combine(
    // Add ISO timestamp to all log entries
    winston.format.timestamp(),
    // Capture full stack traces for errors
    winston.format.errors({ stack: true }),
    // Format logs as JSON for structured logging (enables easy parsing and filtering)
    winston.format.json(),
  ),

  // Default metadata added to all logs
  defaultMeta: {
    service: 'auth-service',
  },

  // Log transports: define where logs are written
  transports: [
    // Console transport: output logs to console with colorized formatting
    // Used for development and real-time monitoring
    new winston.transports.Console({
      format: winston.format.combine(
        // Colorize log levels for better readability in console
        winston.format.colorize(),
        // Simple format for console: level, message
        winston.format.simple(),
      ),
    }),

    // Error log file: only logs with level 'error' and above
    // Rotates daily and keeps logs for 14 days
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log', // Pattern: error-2024-01-15.log
      datePattern: 'YYYY-MM-DD', // Daily rotation pattern
      level: 'error', // Only error-level logs
      maxSize: '20m', // Rotate when file size exceeds 20MB
      maxFiles: '14d', // Keep log files for 14 days
      zippedArchive: false, // Don't compress old logs (can be enabled for space saving)
    }),

    // Combined log file: logs all levels (info, warn, error, debug)
    // Rotates daily and keeps logs for 14 days
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log', // Pattern: combined-2024-01-15.log
      datePattern: 'YYYY-MM-DD', // Daily rotation pattern
      maxSize: '20m', // Rotate when file size exceeds 20MB
      maxFiles: '14d', // Keep log files for 14 days
      zippedArchive: false, // Don't compress old logs (can be enabled for space saving)
    }),
  ],

  // Exit on error: if set to true, process exits when error occurs in transport
  // Set to false to allow graceful error handling
  exitOnError: false,

  // Exception handler: catch unhandled exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],

  // Rejection handler: catch unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
};

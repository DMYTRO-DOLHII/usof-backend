const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Set default log level
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.json() // Format logs as JSON
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize console output
        winston.format.simple() // Format logs as simple text
      )
    }),
    // File transport for logging to a file
    new winston.transports.File({
      filename: 'logs/app.log', // Log file path
      level: 'error', // Log only error messages to file
    }),
  ],
});

// Export the logger
module.exports = logger;

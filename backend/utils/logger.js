import winston from "winston";
import morgan from "morgan";
import path from "path";
import fs from "fs";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger
const logger = winston.createLogger({
  level: "info", // Only show info and above
  format: logFormat,
  transports: [
    // Console transport - only for essential logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: "info", // Only show info and above in console
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for API requests
    new winston.transports.File({
      filename: path.join(logsDir, "api.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});

// Create Morgan stream for API logging (write plain line to stdout only)
const morganStream = {
  write: (message) => {
    // Write the concise line without winston prefixes/metadata
    process.stdout.write(message);
  },
};

// Custom Morgan format for essential API logging (concise single line)
const morganFormat = morgan(
  (tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);
    return `${method} ${url} ${status} ${responseTime}ms`;
  },
  { stream: morganStream }
);

// Helper functions for different log levels
export const logRequest = (req, res, next) => {
  // No-op: request logging handled solely by morgan concise line above
  next();
};

export const logError = (error, req, res, next) => {
  logger.error("Error occurred", {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });
  next(error);
};

export { morganFormat as morganMiddleware };
export default logger;

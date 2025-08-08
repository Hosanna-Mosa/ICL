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

// Create Morgan stream for API logging
const morganStream = {
  write: (message) => {
    logger.info(message.trim(), { source: "morgan" });
  },
};

// Custom Morgan format for essential API logging
const morganFormat = morgan(
  (tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);

    // Only log errors or important requests
    if (
      status >= 400 ||
      method === "POST" ||
      method === "PUT" ||
      method === "DELETE"
    ) {
      const logData = {
        method,
        url,
        status,
        responseTime,
        timestamp: new Date().toISOString(),
      };

      if (status >= 400) {
        logger.error("API Error", logData);
      } else {
        logger.info("API Request", logData);
      }
    }

    return `${method} ${url} ${status} ${responseTime}ms`;
  },
  { stream: morganStream }
);

// Helper functions for different log levels
export const logRequest = (req, res, next) => {
  // Only log important requests (errors, POST, PUT, DELETE)
  if (req.method === "GET" && res.statusCode < 400) {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      logger.error("Request Error", logData);
    } else {
      logger.info("Request completed", logData);
    }
  });

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

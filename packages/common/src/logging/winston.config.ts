import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

export interface WinstonConfigOptions {
  serviceName?: string;
  logLevel?: string;
  logDir?: string;
  enableFileLogging?: boolean;
  enableConsoleLogging?: boolean;
}

export const createWinstonConfig = (
  options: WinstonConfigOptions = {}
): WinstonModuleOptions => {
  const {
    serviceName = "service",
    logLevel = process.env.LOG_LEVEL || "info",
    logDir = "logs",
    enableFileLogging = true,
    enableConsoleLogging = true,
  } = options;

  const transports: winston.transport[] = [];

  // Console transport
  if (enableConsoleLogging) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }

  // File transports
  if (enableFileLogging) {
    // Error log file
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      })
    );

    // Combined log file
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/combined-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      })
    );

    // Service-specific log file
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/${serviceName}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      })
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    defaultMeta: { service: serviceName },
    transports,
  };
};

export const defaultWinstonConfig: WinstonModuleOptions = createWinstonConfig();

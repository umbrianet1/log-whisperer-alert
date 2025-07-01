
import winston from 'winston';

// Configurazione dei livelli di log personalizzati
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colori per i livelli di log
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Formato personalizzato per i log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    if (info.stack) {
      return `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`;
    }
    
    const meta = info.metadata || {};
    const metaStr = Object.keys(meta).length > 0 ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    
    return `${info.timestamp} ${info.level}: ${info.message}${metaStr}`;
  })
);

// Creazione del logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    // Console transport per sviluppo
    new winston.transports.Console({
      format: logFormat,
    }),
    
    // File transport per errori
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    
    // File transport per tutti i log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Wrapper per logging strutturato
export const loggerService = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },
  
  http: (message: string, meta?: any) => {
    logger.http(message, meta);
  },
  
  // Metodi specializzati per casi d'uso comuni
  apiCall: (endpoint: string, method: string, status: number, duration: number, meta?: any) => {
    logger.info('API Call', {
      endpoint,
      method,
      status,
      duration: `${duration}ms`,
      ...meta
    });
  },
  
  security: (event: string, meta?: any) => {
    logger.warn(`SECURITY: ${event}`, meta);
  },
  
  performance: (metric: string, value: number, meta?: any) => {
    logger.info(`PERFORMANCE: ${metric}`, { value, ...meta });
  }
};

// Esporta il logger di default
export default logger;

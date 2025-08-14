import pino from 'pino';

const commonPinoConfig = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', // Log debug in dev, info in prod
  serializers: {
    error: pino.stdSerializers.err, // Serialize Error objects
  },
};

const logger = process.env.NODE_ENV === 'development'
  ? pino({
      ...commonPinoConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    })
  : pino(commonPinoConfig); // No transport in production or test, defaults to JSON to stdout

export { logger };
import { createLogger, format, transports } from 'winston';

const isProduction = process.env.NODE_ENV === 'production'
console.log('isProduction: ' + isProduction);
export const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    exitOnError: false
});

if (!isProduction) {
    logger.add(new transports.Console({
        format: format.simple()
    }));
} else {
    logger.add(new transports.Console({
        handleExceptions: true,
        format: format.combine(format.timestamp(), format.json()),
    }));
}
import { createLogger, format, transports } from 'winston';

const isProduction = process.env.ENV === 'production'

export const logger = createLogger({
    level: isProduction ? 'info' : 'debug'
});

if (!isProduction) {
    logger.add(new transports.Console({
        format: format.simple()
    }));
} else {
    logger.add(new transports.File({
        filename: './logs/log.log',
        format: format.combine(format.timestamp(), format.json()),
    }));
}
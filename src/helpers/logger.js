import { createLogger, format, transports } from 'winston';

const isProduction = process.env.ENV === 'production'

export const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    exitOnError: false
});

if (!isProduction) {
    logger.add(new transports.Console({
        format: format.simple()
    }));
} else {
    logger.add(new transports.File({
        handleExceptions: true,
        maxsize: 5242880, //5MB
        maxFiles: 5,
        filename: './logs/log.log',
        format: format.combine(format.timestamp(), format.json()),
    }));
}

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
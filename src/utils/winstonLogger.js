import { createLogger, format, transports } from 'winston';

import 'dotenv/config';

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.simple(),
        format.timestamp(),
        format.printf((info) => {
            return `[${info.level}] : [${info.timestamp}] - ${info.message}`
        }),
    ),
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf((info) => {
                return `[${info.level}] - ${info.message}`
            }),
        ),
    }));
}
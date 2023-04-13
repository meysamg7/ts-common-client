import winston, {format} from "winston";

export enum Loggerlevels {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    HTTP = "http",
    VERBOSE = "verbose",
    DEBUG = "debug",
    SILLY = "silly",
}
export class Logger {
    private static logger: winston.Logger;
    static init(serviceName: string) {
        Logger.logger = winston.createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.prettyPrint()
            ),
            defaultMeta: { service: serviceName},
            transports: [
                //
                // - Write all logs with importance level of `error` or less to `error.log`
                // - Write all logs with importance level of `info` or less to `combined.log`
                //
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ],
        });

        // If we're not in production then log to the `console` with the format:
        // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        if (process.env.NODE_ENV !== 'production') {
            Logger.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }
    static log(level: Loggerlevels,  label: string, message: string){
        Logger.logger.log({
            level,
            message,
            label,
        });
    }
}
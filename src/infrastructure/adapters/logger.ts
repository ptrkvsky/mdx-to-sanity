import pino from "pino";
import type { Logger } from "../../domain/services.js";

function createPinoLogger(level: string = "info"): pino.Logger {
	const isDevelopment = process.env.NODE_ENV !== "production";

	return pino({
		level,
		transport: isDevelopment
			? {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss Z",
						ignore: "pid,hostname",
					},
				}
			: undefined,
	});
}

export function createLogger(level?: string): Logger {
	const logLevel = level || process.env.LOG_LEVEL || "info";
	const pinoLogger = createPinoLogger(logLevel);

	return {
		debug: (message: string, context?: Record<string, unknown>) => {
			pinoLogger.debug(context || {}, message);
		},
		info: (message: string, context?: Record<string, unknown>) => {
			pinoLogger.info(context || {}, message);
		},
		warn: (message: string, context?: Record<string, unknown>) => {
			pinoLogger.warn(context || {}, message);
		},
		error: (
			message: string,
			error?: Error | unknown,
			context?: Record<string, unknown>,
		) => {
			pinoLogger.error(
				{
					err: error,
					...context,
				},
				message,
			);
		},
	};
}


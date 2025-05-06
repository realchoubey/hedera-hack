export const logger = {
    info: (message: string, ...args: any[]): void => {
        console.log(`[INFO] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]): void => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]): void => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]): void => {
        console.debug(`[DEBUG] ${message}`, ...args);
    },
};

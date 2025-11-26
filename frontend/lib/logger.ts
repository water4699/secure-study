// Simple logger utility for controlling log output
const isDevelopment = process.env.NODE_ENV === 'development';
const disableVerboseLogs = process.env.NEXT_PUBLIC_DISABLE_VERBOSE_LOGS === 'true';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (!disableVerboseLogs && isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};



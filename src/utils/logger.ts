import isDebugMode from './debug';

const logger = {
  log: (...args: unknown[]): void => {
    if (isDebugMode()) console.log(...args);
  },
  debug: (...args: unknown[]): void => {
    if (isDebugMode()) console.debug(...args);
  },
  info: (...args: unknown[]): void => {
    if (isDebugMode()) console.info(...args);
  },
  warn: (...args: unknown[]): void => {
    // always show warnings
    console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    // always show errors
    console.error(...args);
  },
};

export default logger;

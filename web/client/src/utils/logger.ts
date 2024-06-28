class Logger {
  private moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  private formatMessage(level: string, ...args: any[]) {
    const stack = new Error().stack;
    const stackLines = stack ? stack.split("\n") : [];
    const functionNameMatch = stackLines[3].match(/at (\S+)/);
    const functionName = functionNameMatch ? functionNameMatch[1] : "unknown";

    return `[${this.moduleName} -> ${functionName}] ${level}: ${args.join(
      " "
    )}`;
  }

  log(...args: any[]) {
    console.log("\x1b[32m%s\x1b[0m", this.formatMessage("LOG", ...args));
  }

  info(...args: any[]) {
    console.log("\x1b[36m%s\x1b[0m", this.formatMessage("INFO", ...args));
  }

  debug(...args: any[]) {
    console.debug("\x1b[35m%s\x1b[0m", this.formatMessage("DEBUG", ...args));
  }

  error(...args: any[]) {
    console.error("\x1b[31m%s\x1b[0m", this.formatMessage("ERROR", ...args));
  }
}

export default function getLogger(moduleName: string) {
  return new Logger(moduleName);
}

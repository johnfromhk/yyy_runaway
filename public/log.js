const fs = require('fs');

class Logger {
    constructor(logFilePath = 'log.txt') {
        this.stream = fs.createWriteStream(logFilePath, { flags: 'a' });
    }

    log(...args) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Circular]';
                }
            } else {
                return String(arg);
            }
        }).join(' ');
        console.log(...args);
        const fullMessage = `[${timestamp}] ${message}\n`;
        this.stream.write(fullMessage);
    }
    nlog(...args) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Circular]';
                }
            } else {
                return String(arg);
            }
        }).join(' ');
        const fullMessage = `[${timestamp}] ${message}\n`;
        this.stream.write(fullMessage);
    }
    ntimestampnlog(...args) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Circular]';
                }
            } else {
                return String(arg);
            }
        }).join('');
        const fullMessage = `${message}\n`;
        this.stream.write(fullMessage);
    }
}
module.exports = Logger;
// 使用示例
//const logger = new Logger();
//logger.log('多进程写日志可能有风险');
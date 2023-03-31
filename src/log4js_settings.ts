import log4js from 'log4js';
if (process.env.LOG4JS_CONFIG_PATH === undefined) {
    throw new Error('LOG4JS_CONFIG_PATH is empty');
} else {
    const log4js_path: string = process.env.LOG4JS_CONFIG_PATH;
    log4js.configure(log4js_path);
}
export const log4js_obj = log4js;

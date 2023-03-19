// Response for Uptime Robot
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const http = require('http');
http.createServer(function (_request: any, response: { writeHead: (arg0: number, arg1: { 'Content-Type': string; }) => void; end: (arg0: string) => void; }) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Discord bot is active now \n');
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
}).listen(process.env.PORT || 3000);
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('./app/index.js');

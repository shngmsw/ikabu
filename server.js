// Response for Uptime Robot
const http = require("http");
http
    .createServer(function(request, response) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Discord bot is active now \n");
    })
    .listen(process.env.PORT || 3000);
require('./app/index.js');
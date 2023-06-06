import {WebSocketServer} from 'ws'
import * as fs from 'fs';
import * as http from 'http';
import path from 'path';
import dayjs from 'dayjs';

const wss = new WebSocketServer({noServer: true});
const clients = new Set();

http.createServer((request, response) => {
    if (request.url === '/ws' && request.headers.upgrade &&
        request.headers.upgrade.toLowerCase() === 'websocket' &&
        request.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(request, request.socket, Buffer.alloc(0), onSocketConnect);
    } else if (request.url === "/") {
        const pathToView = path.toNamespacedPath('client/index.html');

        fs.createReadStream(pathToView).pipe(response);
    } else {
        const filePath = request.url.substring(1);

        fs.access(filePath, fs.constants.R_OK, error => {
            if (error) {
                response.statusCode = 404;
                response.end('Not found');
            } else {
                fs.createReadStream(filePath).pipe(response);
            }
        });
    }
}).listen(3000, 'localhost', () => {
    console.log('Server started on port 3000');
});

function onSocketConnect(ws) {
    ws.name = `Юзер ${clients.size + 1}`;
    clients.add(ws);

    ws.on("message", messageData => {
        const date = dayjs().format('hh:mm');

        for (let client of clients) {
            const message = `${date} ${client.name}: ${messageData}`;

            client.send(message, {binary: false});
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
    });
}
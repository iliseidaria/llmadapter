import http from 'http';
import { delegate } from './router.js';
import fsPromises from 'fs/promises';
const serverConfig =  await fsPromises.readFile('./config.json', 'utf-8').then(JSON.parse);

import bodyReader from './middlewares/bodyReader.js';

class Server {
    constructor() {
        this.middlewares = [];
        this.server = http.createServer(this.handleRequest.bind(this));
        this.server.setTimeout(0);
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    async attachMiddlewares(req, res, middlewaresList, finalHandler) {
        const executeMiddleware = async (index) => {
            if (index < middlewaresList.length) {
                const middleware = middlewaresList[index];
                try {
                    await middleware(req, res, () => executeMiddleware(index + 1));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Middleware Error: ' + error.message);
                }
            } else {
                await finalHandler(req, res);
            }
        };
        await executeMiddleware(0);
    }

    async handleRequest(req, res) {
        try {
            await this.attachMiddlewares(req, res, this.middlewares, delegate);
        }catch(error){
            console.log(error);
        }
    }

    listen(port, callback) {
        this.server.listen(port, callback);
    }
}

const server = new Server();

server.use(bodyReader);

server.listen(serverConfig.PORT, () => {
    console.log(`Server running on http://localhost:${serverConfig.PORT}/`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', {
        message: err.message,
        stack: err.stack
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', {
        reason: reason,
        promise: promise
    });
});


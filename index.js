import http from 'http';
import { delegate } from './router.js';
import serverConfig from './config.json' assert { type: 'json' };

import bodyReader from './middlewares/bodyReader.js';

class Server {
    constructor() {
        this.middlewares = [];
        this.server = http.createServer(this.handleRequest.bind(this));
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
        await this.attachMiddlewares(req, res, this.middlewares, delegate);
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


const http = require('http');

const routerManager = require('./routerManager');
const serverConfig = require('./config.json');

const middlewares = {
    bodyReader: require('./middlewares/bodyReader'),
    APIKeyInjection: require('./middlewares/APIKeyInjector')
};

async function attachMiddlewares(req, res, middlewaresList, finalHandler) {
    const executeMiddleware = async (index) => {
        if (index < middlewaresList.length) {
            const middleware = middlewaresList[index];
            try {
                await middleware(req, res, () => executeMiddleware(index + 1));
            } catch (error) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Middleware Error: ' + error.message);
            }
        } else {
            finalHandler(req, res);
        }
    };
    await executeMiddleware(0);
}

const server = http.createServer(async (req, res) => {
    const middlewaresList = [middlewares.bodyReader,middlewares.APIKeyInjection];
    await attachMiddlewares(req, res, middlewaresList, routerManager.delegate);
});

server.listen(serverConfig.PORT, () => {
    console.log(`Server running on http://localhost:${serverConfig.PORT}/`);
});

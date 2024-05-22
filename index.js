const http = require('http');
const routerManager = require('./router');
const serverConfig = require('./config.json');

async function attachMiddlewares(req, res, middlewaresList, finalHandler) {
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


const middlewares = [
    require('./middlewares/bodyReader'),
    require('./middlewares/authentication'),
    require('./middlewares/authorization')
];

const server = http.createServer(async (req, res) => {
    await attachMiddlewares(req, res, middlewares, routerManager.delegate);
});

server.listen(serverConfig.PORT, () => {
    console.log(`Server running on http://localhost:${serverConfig.PORT}/`);
});

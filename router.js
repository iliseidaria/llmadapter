const url = require('url');
const { getTextResponse, getTextStreamingResponse } = require('./controllers/controller');

const routes = {
    'POST': {
        '/apis/v1/spaces/:spaceId/llms/texts/generate': getTextResponse,
        '/apis/v1/spaces/:spaceId/llms/texts/streaming/generate': getTextStreamingResponse,
    }
};

function extractParams(path, route) {
    const pathSegments = path.split('/');
    const routeSegments = route.split('/');
    const params = {};

    routeSegments.forEach((segment, index) => {
        if (segment.startsWith(':')) {
            params[segment.slice(1)] = pathSegments[index];
        }
    });

    return params;
}

function matchRoute(method, path) {
    const methodRoutes = routes[method] || {};
    for (const route in methodRoutes) {
        const regex = new RegExp('^' + route.replace(/:\w+/g, '\\w+') + '$');
        if (regex.test(path)) {
            return { handler: methodRoutes[route], params: extractParams(path, route) };
        }
    }
    return null;
}

async function delegate(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const matchedRoute = matchRoute(req.method, parsedUrl.pathname);

    if (matchedRoute) {
        req.params = matchedRoute.params;
        await matchedRoute.handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = { delegate };

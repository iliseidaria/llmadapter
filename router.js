import {parse as parseUrl} from 'url';
import * as Request from './utils/request.js';
import * as Text from './controllers/Text.js';
import * as Audio from './controllers/Audio.js';
import * as Image from './controllers/Image.js';
import * as Video from './controllers/Video.js';

const routes = {
    'GET': {},
    'POST': {
        '/apis/v1/text/generate': Text.getTextResponse,
        '/apis/v1/text/streaming/generate': Text.getTextStreamingResponse,
        '/apis/v1/image/generate': Image.generateImage,
        '/apis/v1/image/edit': Image.editImage,
        '/apis/v1/image/variants': Image.generateImageVariants,
        '/apis/v1/video/generate': Video.generateVideo,
        '/apis/v1/audio/generate': Audio.generateAudio
    },
    'PUT': {},
};

function matchRoute(method, path) {
    const methodRoutes = routes[method];
    if (!methodRoutes) return null;

    for (const route in methodRoutes) {
        const regex = new RegExp('^' + route.replace(/:\w+/g, '([^/]+)') + '$');
        if (regex.test(path)) {
            return {handler: methodRoutes[route], params: Request.extractParams(path, route)};
        }
    }
    return null;
}

async function delegate(req, res) {
    const parsedUrl = parseUrl(req.url, true);
    const matchedRoute = matchRoute(req.method, parsedUrl.pathname);

    if (matchedRoute) {
        req.params = matchedRoute.params;
        await matchedRoute.handler(req, res);
    } else {
        Request.sendResponse(res, 404, 'application/json', {
            success: false,
            message: 'Invalid route'
        });
    }
}

export {delegate};

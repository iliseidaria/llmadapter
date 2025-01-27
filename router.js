import {parse as parseUrl} from 'url';
import * as Request from './utils/request.js';
import * as Text from './controllers/Text.js';
import * as Audio from './controllers/Audio.js';
import * as Image from './controllers/Image.js';
import * as Video from './controllers/Video.js';
import * as Chat from './controllers/Chat.js';
import * as Util from './controllers/Util.js';
import * as Storage from './controllers/Storage.js';

const routes = {
    'GET': {
        '/apis/v1/authRequirements': Util.getAuthRequirements,
        '/apis/v1/llms': Util.listLlms,
        '/apis/v1/llms/defaults': Util.getDefaultLlms,
        '/apis/v1/images': Storage.getImage,
        '/apis/v1/audios': Storage.getAudio,
        '/apis/v1/videos': Storage.getVideo,
        '/apis/v1/uploads': Storage.getUploadURL,
        '/apis/v1/downloads': Storage.getDownloadURL,
    },
    'POST': {
        '/apis/v1/text/generate': Text.getTextResponse,
        '/apis/v1/text/generate/advanced': Text.getTextResponseAdvanced,
        '/apis/v1/text/streaming/generate': Text.getTextStreamingResponse,
        '/apis/v1/chat/generate': Chat.getChatResponse,
        '/apis/v1/chat/streaming/generate': Chat.getChatStreamingResponse,
        '/apis/v1/image/generate': Image.generateImage,
        '/apis/v1/image/edit': Image.editImage,
        '/apis/v1/image/variants': Image.generateImageVariants,
        '/apis/v1/audio/generate': Audio.textToSpeech,
        '/apis/v1/audio/listVoices': Audio.listVoices,
        '/apis/v1/audio/listEmotions': Audio.listEmotions,
        '/apis/v1/video/lipsync': Video.lipsync,
        '/apis/v1/llms/languages': Util.getModelLanguages,
    },
    'PUT': {
        '/apis/v1/images': Storage.putImage,
        '/apis/v1/audios': Storage.putAudio,
        '/apis/v1/videos': Storage.putVideo,
    },
    'DELETE': {
        '/apis/v1/images': Storage.deleteImage,
        '/apis/v1/audios': Storage.deleteAudio,
        '/apis/v1/videos': Storage.deleteVideo,
    },
    'HEAD': {
        '/apis/v1/images': Storage.headImage,
        '/apis/v1/audios': Storage.headAudio,
        '/apis/v1/videos': Storage.headVideo,
    }
};

function matchRoute(method, path) {
    const methodRoutes = routes[method];
    if (!methodRoutes) return null;

    for (const route in methodRoutes) {
        const routeRegex = route.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp(`^${routeRegex}$`);
        const match = regex.exec(path);

        if (match) {
            const paramNames = route.match(/:(\w+)/g) || [];
            const params = {};

            paramNames.forEach((paramName, index) => {
                params[paramName.substring(1)] = match[index + 1];
            });

            return { handler: methodRoutes[route], params };
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
            message: 'Invalid route'
        });
    }
}

export {delegate};

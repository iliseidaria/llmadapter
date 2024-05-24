import { v4 as uuidv4 } from 'uuid';
import { createStreamEmitter } from '../handlers/utils/streamEmitter.js';
import * as Request from '../utils/request.js';
import * as Text from '../handlers/Text.js';

const cache = {};

async function getTextResponse(req, res) {
    const { modelName, prompt, messagesQueue, modelConfig, APIKey } = req.body;
    if (!modelName || !prompt) {
        return Request.sendResponse(res, 400, "application/json", {
            success: false,
            message: "Bad Request. Model name and prompt are required"
        });
    }
    try {
        const modelResponse = await Text.getTextResponse(APIKey,modelName, prompt, modelConfig, messagesQueue);
        Request.sendResponse(res, 200, "application/json", {
            success: true,
            data: modelResponse
        });
    } catch (error) {
        Request.sendResponse(res, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}

async function getTextStreamingResponse(req, res) {
    const { modelName, prompt, messagesQueue, modelConfig, APIKey, sessionId } = req.body;

    if (!modelName || !prompt) {
        return Request.sendResponse(res, 400, "application/json", {
            success: false,
            message: "Bad Request. Model name and prompt are required"
        });
    }

    if (sessionId && cache[sessionId]) {
        const sessionData = cache[sessionId];
        const newData = sessionData.data.slice(sessionData.lastSentIndex);
        sessionData.lastSentIndex = sessionData.data.length;
        const isEnd = sessionData.end || false;

        if (isEnd) delete cache[sessionId];

        return Request.sendResponse(res, 200, "application/json", {
            success: true,
            data: newData,
            end: isEnd
        });
    }

    const newSessionId = uuidv4();
    cache[newSessionId] = { data: '', lastSentIndex: 0 };
    const streamEmitter = createStreamEmitter();

    streamEmitter.on('data', data => {
        cache[newSessionId].data += data;
    });

    streamEmitter.on('end', () => {
        cache[newSessionId].end = true;
    });

    streamEmitter.on('final', finalData => {
        cache[newSessionId].data += finalData.messages.join('');
    });

    try {
        await Text.getTextStreamingResponse(APIKey,modelName, prompt, modelConfig, messagesQueue, streamEmitter);
        Request.sendResponse(res, 200, "application/json", {
            success: true,
            sessionId: newSessionId,
            data: cache[newSessionId].data,
            end: cache[newSessionId].end || false
        });
    } catch (error) {
        delete cache[newSessionId];
        Request.sendResponse(res, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}

export {
    getTextResponse,
    getTextStreamingResponse
};

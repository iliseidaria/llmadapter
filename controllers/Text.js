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
    const { modelName, prompt, messagesQueue, modelConfig, APIKey } = req.body;
    let { sessionId } = req.body;

    if (!modelName || !prompt) {
        return Request.sendResponse(res, 400, "application/json", {
            success: false,
            message: "Bad Request. Model name and prompt are required"
        });
    }

    if (!sessionId) {
        sessionId = uuidv4();
    }

    if (cache[sessionId]) {
        const sessionData = cache[sessionId];
        const newData = sessionData.data.slice(sessionData.lastSentIndex);
        sessionData.lastSentIndex = sessionData.data.length;
        const isEnd = sessionData.end || false;

        if (isEnd) delete cache[sessionId];

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (newData) {
            res.write(`data: ${newData}\n\n`);
        }

        if (isEnd) {
            res.write('event: end\ndata: {}\n\n');
            res.end();
        }

        return;
    }

    cache[sessionId] = { data: '', lastSentIndex: 0 };
    const streamEmitter = createStreamEmitter();

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write(`data: {"sessionId": "${sessionId}"}\n\n`);

    streamEmitter.on('data', data => {
        cache[sessionId].data += data;
        if (data.trim()) {
            res.write(`data: ${data}\n\n`);
        }
    });

    streamEmitter.on('end', () => {
        cache[sessionId].end = true;
        res.write('event: end\ndata: {}\n\n');
        res.end();
    });

    streamEmitter.on('final', finalData => {
        cache[sessionId].data += finalData.messages.join('');
    });

    try {
        await Text.getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter);
    } catch (error) {
        delete cache[sessionId];
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

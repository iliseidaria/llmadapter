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

    if (!modelName || !prompt || !APIKey) {
        return res.status(400).json({
            success: false,
            message: "Bad Request. APIKey, modelName, and prompt are required"
        });
    }

    if (!sessionId) {
        sessionId = uuidv4();
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write(`data: ${JSON.stringify({ sessionId })}\n\n`);

    cache[sessionId] = { data: '', lastSentIndex: 0, end: false };
    const streamEmitter = createStreamEmitter();

    streamEmitter.on('data', data => {
        cache[sessionId].data += data;
        if (data.trim()) {
            res.write(`data: ${JSON.stringify({ message: data })}\n\n`);
        }
    });

    streamEmitter.on('end', fullResponse => {
        cache[sessionId].end = true;
        cache[sessionId].fullResponse = fullResponse.fullMessage;
        cache[sessionId].metadata = fullResponse.metadata;
        res.write(`event: end\ndata: ${JSON.stringify({ end: true, fullResponse: cache[sessionId].fullResponse, metadata: cache[sessionId].metadata })}\n\n`);
        res.end();
        delete cache[sessionId];
    });

    try {
        await Text.getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter);
    } catch (error) {
        if (!res.writableEnded) {
            res.write(`event: error\ndata: ${JSON.stringify({ success: false, message: error.message })}\n\n`);
            res.end();
        }
        delete cache[sessionId];
    }
}

export {
    getTextResponse,
    getTextStreamingResponse
};

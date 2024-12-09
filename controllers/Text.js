import { v4 as uuidv4 } from 'uuid';
import { createStreamEmitter } from '../handlers/utils/streamEmitter.js';
import * as Request from '../utils/request.js';
import * as Text from '../handlers/Text.js';

const cache = {};

async function getTextResponseAdvanced(req,res){
    const {modelName, promptObject,modelConfig,APIKey} = req.body;
    if(!modelName){
        return Request.sendResponse(res, 400, "application/json", {
            message: "Bad Request. Model name is required"
        });
    }
    if(!promptObject){
        return Request.sendResponse(res, 400, "application/json", {
            message: "Bad Request. Prompt object is required"
        });
    }if(!APIKey){
        return Request.sendResponse(res, 400, "application/json", {
            message: "Bad Request. API Key is required"
        });
    }
    try{
        const modelResponse = await Text.getTextResponseAdvanced(APIKey,modelName,promptObject,modelConfig);
        return Request.sendResponse(res, 200, "application/json", {
            data: modelResponse
        });
    }catch(error){
        return Request.sendResponse(res, error.statusCode || 500, "application/json",error.message);
    }
}

async function getTextResponse(req, res) {
    const { modelName, prompt, messagesQueue, modelConfig, APIKey } = req.body;
    if (!modelName || !prompt) {
        return Request.sendResponse(res, 400, "application/json", {
            message: "Bad Request. Model name and prompt are required"
        });
    }
    try {
        const modelResponse = await Text.getTextResponse(APIKey,modelName, prompt, modelConfig, messagesQueue);
        return Request.sendResponse(res, 200, "application/json", {
            data: modelResponse
        });
    } catch (error) {
        Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: error.message
        });
    }
}


async function getTextStreamingResponse(req, res) {
    const { modelName, prompt, messagesQueue, modelConfig, APIKey } = req.body;
    let { sessionId } = req.body;

    if (!modelName || !prompt || !APIKey) {
        return Request.sendResponse(res, 400, "application/json", {
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

    cache[sessionId] = { data: '', lastSentIndex: 0, end: false };

    res.write(`event: beginSession\ndata: ${JSON.stringify({ sessionId })}\n\n`);

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
        res.write(`event: end\ndata: ${JSON.stringify({ fullResponse: cache[sessionId].fullResponse, metadata: cache[sessionId].metadata })}\n\n`);
        res.end();
        delete cache[sessionId];
    });

    streamEmitter.on('error', error => {
        if (!res.writableEnded) {
            res.write(`event: error\ndata: ${JSON.stringify({message: error.message })}\n\n`);
            res.end();
        }
        delete cache[sessionId];
    });

    try {
        await Text.getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter);
    } catch (error) {
        if (!res.writableEnded) {
            res.write(`event: error\ndata: ${JSON.stringify({message: error.message })}\n\n`);
            res.end();
        }
        delete cache[sessionId];
    }
}

export {
    getTextResponse,
    getTextStreamingResponse,
    getTextResponseAdvanced
};

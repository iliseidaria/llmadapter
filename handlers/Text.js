const TextWrapper = require('../llms/wrappers/TextWrapper.js');

async function getTextResponse(APIKey, modelName, prompt, modelConfig, messagesQueue) {
    if (messagesQueue && messagesQueue.length > 0) {
        return await TextWrapper.getTextConversationResponse(APIKey, modelName, prompt, modelConfig, messagesQueue);
    } else {
        return await TextWrapper.getTextResponse(APIKey, modelName, prompt, modelConfig);
    }
}

async function getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter) {
    if (messagesQueue && messagesQueue.length > 0) {
        return await TextWrapper.getTextConversationStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter);
    } else {
        return await TextWrapper.getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, streamEmitter);
    }
}

export {
    getTextResponse,
    getTextStreamingResponse
};

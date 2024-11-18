import LLMFactory from "./factory/LLMFactory.js";

async function getTextResponse(APIKey, modelName, prompt, modelConfig, messagesQueue) {
    if (messagesQueue && messagesQueue.length > 0) {
        const modelInstance = await LLMFactory.createLLM(modelName, APIKey,modelConfig);
        return await modelInstance.getTextConversationResponse(prompt, messagesQueue,modelConfig);
    } else {
        const modelInstance = await LLMFactory.createLLM(modelName, APIKey,modelConfig);
        return await modelInstance.getTextResponse(prompt,modelConfig);
    }
}

async function getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter) {
    if (messagesQueue && messagesQueue.length > 0) {
        const modelInstance = await LLMFactory.createLLM(modelName, APIKey, modelConfig);
        return await modelInstance.getTextConversationStreamingResponse(prompt,messagesQueue,streamEmitter);
    } else {
        const modelInstance = await  LLMFactory.createLLM(modelName, APIKey, modelConfig);
        return await modelInstance.getTextStreamingResponse(prompt,streamEmitter);
    }
}

export {
    getTextResponse,
    getTextStreamingResponse
};

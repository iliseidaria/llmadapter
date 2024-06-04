import LLMFactory from  '../factory/LLMFactory.js';

async function getTextResponse(APIKey,modelName, prompt, modelConfig) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey,modelConfig);
    return await modelInstance.getTextResponse(prompt,modelConfig);
}
async function getTextConversationResponse(APIKey,modelName, prompt, modelConfig, messagesQueue) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey,modelConfig);
    return await modelInstance.getTextConversationResponse(prompt, messagesQueue,modelConfig);
}
async function getTextStreamingResponse(APIKey, modelName, prompt, modelConfig, streamEmitter) {
    const modelInstance = await  LLMFactory.createLLM(modelName, APIKey, modelConfig);
    return await modelInstance.getTextStreamingResponse(prompt,streamEmitter);
}
async function getTextConversationStreamingResponse(APIKey, modelName, prompt, modelConfig, messagesQueue, streamEmitter) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, modelConfig);
    return await modelInstance.getTextConversationStreamingResponse(prompt,messagesQueue,streamEmitter);
}

export {
    getTextResponse,
    getTextConversationResponse,
    getTextStreamingResponse,
    getTextConversationStreamingResponse
}
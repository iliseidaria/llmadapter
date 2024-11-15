import LLMFactory from "./factory/LLMFactory.js";

async function getChatResponse(APIKey, modelName, chat, modelConfig) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, modelConfig);
    return await modelInstance.getChatResponse(chat);
}

async function getChatStreamingResponse(APIKey, modelName, chat, modelConfig, streamEmitter) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, modelConfig);
    return await modelInstance.getChatStreamingResponse(chat);
}

export {
    getChatResponse,
    getChatStreamingResponse
};

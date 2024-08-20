import LLMFactory from './factory/LLMFactory.js';

async function lipsync(APIKey, modelName, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, configs);
    return await modelInstance.lipsync();
}
export {
    lipsync
}

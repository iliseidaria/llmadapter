import LLMFactory from './factory/LLMFactory.js';

async function textToSpeech(APIKey, modelName, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, configs);
    return await modelInstance.textToSpeech(configs);
}
async function listVoices(APIKey, modelName, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, configs);
    return await modelInstance.listVoices(configs);
}
async function listEmotions(modelName, configs) {
    configs.method = "listEmotions";
    const modelInstance = await LLMFactory.createLLM(modelName, "", configs);
    return await modelInstance.listEmotions();
}
export {
    textToSpeech,
    listVoices,
    listEmotions
}
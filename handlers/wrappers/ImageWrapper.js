import LLMFactory from '../factory/LLMFactory.js';

async function generateImage(APIKey, modelName, prompt, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, configs);
    return await modelInstance.generateImage(prompt, configs);
}
async function generateImageVariants(APIKey,modelName, imageReadStreamSrc, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey);
    return await modelInstance.generateImageVariants(imageReadStreamSrc, configs);
}
async function editImage(APIKey, modelName, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey);
    return await modelInstance.editImage(configs);
}

export {
    generateImage,
    generateImageVariants,
    editImage
}
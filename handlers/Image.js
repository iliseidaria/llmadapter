import LLMFactory from "./factory/LLMFactory.js";

async function generateImage(APIKey, modelName, prompt, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, configs);
    return await modelInstance.generateImage(prompt, configs);
}
async function editImage(APIKey, modelName, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey);
    return await modelInstance.editImage(configs);
}

export {
    generateImage,
    editImage
}
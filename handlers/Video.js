import LLMFactory from "./factory/LLMFactory.js";

async function lipSync(APIKey, modelName, configs) {
    const modelInstance = await LLMFactory.createLLM(modelName, APIKey, configs);
    return await modelInstance.lipSync(configs);
}

export {
    lipSync
}
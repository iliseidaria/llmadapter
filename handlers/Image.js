import  * as ImageWrapper from './wrappers/ImageWrapper.js';

async function generateImage(APIKey, modelName, prompt, configs) {
    return await ImageWrapper.generateImage(APIKey, modelName, prompt, configs);
}

export {
    generateImage
}
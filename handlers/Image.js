import  * as ImageWrapper from './wrappers/ImageWrapper.js';

async function generateImage(APIKey, modelName, prompt) {
    return await ImageWrapper.generateImage(APIKey, modelName, prompt);
}

export {
    generateImage
}
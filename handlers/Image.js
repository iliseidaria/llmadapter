import  * as ImageWrapper from './wrappers/ImageWrapper.js';

async function generateImage(APIKey, modelName, prompt, configs) {
    return await ImageWrapper.generateImage(APIKey, modelName, prompt, configs);
}
async function editImage(APIKey, modelName, configs) {
    return await ImageWrapper.editImage(APIKey, modelName, configs);
}

export {
    generateImage,
    editImage
}
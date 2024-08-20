import * as Request from '../utils/request.js';
import * as Image from '../handlers/Image.js';

async function editImage(request, response) {
    try {
        const modelName =  request.body.modelName;
        delete request.body.modelName;
        const APIKey =  request.body.APIKey;
        delete request.body.APIKey;
        const modelResponse = await Image.editImage(APIKey, modelName, request.body);
        Request.sendResponse(response, 200, "application/json", {
            success: true,
            data: modelResponse
        });
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}
async function generateImage(request, response) {
    try {
        const modelName =  request.body.modelName;
        delete request.body.modelName;
        const APIKey =  request.body.APIKey;
        delete request.body.APIKey;
        const prompt =  request.body.prompt;
        delete request.body.prompt;
        request.body.responseFormat = "b64_json";
        const modelResponse = await Image.generateImage(APIKey, modelName, prompt, request.body);
        Request.sendResponse(response, 200, "application/json", {
            success: true,
            data: modelResponse
        });
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}
        async function generateImageVariants(request, response) {
            try {
        Request.sendResponse(response, 200, "application/json", {
            success: true,
            data: modelResponse
        });
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}

export {
    editImage,
    generateImage,
    generateImageVariants
}
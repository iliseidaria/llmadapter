import * as Request from '../utils/request.js';
import * as Image from '../handlers/Image.js';

async function generateImageEdit(request, response) {
    const { modelName, prompt, apiKey } = req.body;
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
async function generateImage(request, response) {
    const { modelName, prompt, APIKey, variants } = request.body;
    try {
        const modelResponse = await Image.generateImage(APIKey, modelName, prompt, {
            variants: variants,
            size: "512x512",
            quality: "standard",
        });
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
    generateImageEdit,
    generateImage,
    generateImageVariants
}
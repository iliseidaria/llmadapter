import * as Request from '../utils/request.js';
import * as Audio from '../handlers/Audio.js';
async function textToSpeech(request, response) {
    try {
        const modelName =  request.body.modelName;
        delete request.body.modelName;
        const APIKey =  request.body.APIKey;
        delete request.body.APIKey;
        const arrayBuffer = await Audio.textToSpeech(APIKey, modelName, request.body);
        const audioBuffer = Buffer.from(arrayBuffer);
        response.setHeader('Content-Type', 'audio/mpeg');
        response.setHeader('Content-Length', audioBuffer.length);
        response.end(audioBuffer);
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}
async function listVoices(request, response) {
    try {
        const APIKey =  request.body.APIKey;
        delete request.body.APIKey;
        const modelName =  request.body.modelName || request.body.company;
        delete request.body.modelName;
        const modelResponse = await Audio.listVoices(APIKey, modelName, request.body);
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
async function listEmotions(request, response) {
    try {
        const modelName =  request.body.modelName;
        delete request.body.modelName;
        const modelResponse = await Audio.listEmotions(modelName, request.body);
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

export { textToSpeech, listVoices, listEmotions };
import * as Request from '../utils/request.js';
import * as Chat from '../handlers/Chat.js';

async function getChatResponse(req, res) {
    const { APIKey, modelName, chat, modelConfig } = req.body;
    const missingField = ["APIKey", "modelName", "chat"].find(field => !req.body[field]);
    if (missingField) {
        return Request.sendResponse(res, 400, "application/json", {
            message: `Bad Request. ${missingField} is required`
        });
    }
    try {
        const modelResponse = await Chat.getChatResponse(APIKey, modelName, chat, modelConfig || {});
        return Request.sendResponse(res, 200, "application/json", {
            data: modelResponse
        });
    } catch (error) {
        Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: error.message
        });
    }
}


export {
    getChatResponse
};

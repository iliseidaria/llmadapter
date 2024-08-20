import * as Request from '../utils/request.js';
import * as Video from "../handlers/Video.js";

async function lipsync(request, response) {
    const APIKey = request.body.APIKey;
    delete request.body.APIKey;
    const modelName = request.body.modelName;
    delete request.body.modelName;
    try {
        const videoURL = await Video.lipsync(APIKey, modelName, request.body);
        Request.sendResponse(response, 200, "application/json", {
            success: true,
            data: videoURL
        });
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });

    }
}
export {lipsync}




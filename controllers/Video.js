import * as Request from '../utils/request.js';
import * as Video from "../handlers/Video.js";
import * as s3 from "../handlers/S3.js";
import {devBucket} from "./Storage.js";

async function lipsync(request, response) {
    const APIKey = request.body.APIKey;
    delete request.body.APIKey;
    const modelName = request.body.modelName;
    const videoId = request.body.videoId;
    const audioId = request.body.audioId;
    delete request.body.modelName;
    try {
        let videoPath = `${videoId}.mp4`;
        let audioPath = `${audioId}.mp3`;
        request.body.videoUrl = await s3.getDownloadURL(devBucket, videoPath);
        request.body.audioUrl = await s3.getDownloadURL(devBucket, audioPath);
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




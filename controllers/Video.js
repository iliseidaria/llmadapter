import * as Request from '../utils/request.js';
import * as Video from "../handlers/Video.js";
import {devBucket} from "./Storage.js";
import fsPromises from "fs/promises";
const config =  await fsPromises.readFile('./config.json', 'utf-8').then(JSON.parse);
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
        request.body.videoUrl = `${config.S3_URL}/${devBucket}/${videoPath}`;
        request.body.audioUrl = `${config.S3_URL}/${devBucket}/${audioPath}`;
        const videoURL = await Video.lipsync(APIKey, modelName, request.body);
        Request.sendResponse(response, 200, "application/json", {
            data: videoURL
        });
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            message: error.message
        });

    }
}
export {lipsync}




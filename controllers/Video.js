import * as Request from '../utils/request.js';
import * as Video from "../handlers/Video.js";
import * as Apihub from "../handlers/Apihub.js";
import * as S3 from "../handlers/utils/S3Storage.js";
import config from '../config.json' assert { type: 'json' };
function getRandomName() {
    return Math.random().toString(36).substring(7);
}
async function lipsync(request, response) {
    const APIKey = request.body.APIKey;
    delete request.body.APIKey;
    const modelName = request.body.modelName;
    const spaceId=request.body.spaceId;
    const videoId=request.body.videoId;
    const audioId=request.body.audioId;
    delete request.body.modelName;
    try {
        const audioBuffer=await Apihub.getAudio(spaceId,audioId);
        const videoBuffer=await Apihub.getVideo(spaceId,videoId);
        const audioName=getRandomName()+".mp3";
        const videoName=getRandomName()+".mp4";

        await S3.putObject("audios", audioName, audioBuffer);
        await S3.putObject("videos", videoName, videoBuffer);
        request.body.videoUrl=`${config.S3_URL}/videos/${videoName}`;
        request.body.audioUrl=`${config.S3_URL}/audios/${audioName}`;
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




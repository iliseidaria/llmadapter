import * as Request from '../utils/request.js';
import * as Video from "../handlers/Video.js";
import * as Apihub from "../handlers/Apihub.js";
import * as S3 from "../handlers/S3.js";
const config =  await fsPromises.readFile('./config.json', 'utf-8').then(JSON.parse);
import fsPromises from "fs/promises";
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
        await S3.putObject(S3.devBucket, audioName, audioBuffer);
        await S3.putObject(S3.devBucket, videoName, videoBuffer);
        request.body.videoUrl=`${config.S3_URL}/${S3.devBucket}/${videoName}`;
        request.body.audioUrl=`${config.S3_URL}/${S3.devBucket}/${audioName}`;

        //  request.body.videoUrl="https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortvid-03a10044-7741-4cfc-816a-5bccd392d1ee.mp4"
        //  request.body.audioUrl="https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortaud-27623a4f-edab-4c6a-8383-871b18961a4a.wav"
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




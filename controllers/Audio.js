import fetch from "node-fetch";
import * as Request from '../utils/request.js';
const auth = "";
const userId = "";
async function textToSpeech(request, response){
    const url = "https://api.play.ht/api/v2/tts/stream";
    const options = {
        method: "POST",
        headers: {
            accept: "audio/mpeg",
            "content-type": "application/json",
            AUTHORIZATION: auth,
            "X-USER-ID": userId,
        },
        body: JSON.stringify({
            voice_engine: 'PlayHT2.0',
            text: request.body.prompt,
            voice: request.body.voice,
            output_format: "mp3",
            sample_rate: "44100",
            emotion: request.body.emotion,
            style_guidance: request.body.styleGuidance || 20,
            speed: 1,
        }),
    };

    const result = await fetch(url, options);
    result.body.pipe(response);
}
let ttsConfigs;
async function listVoicesAndEmotions(request, response){
    const url = 'https://api.play.ht/api/v2/voices';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            AUTHORIZATION: auth,
            'X-USER-ID': userId
        }
    };
    try {
        if(ttsConfigs){
            Request.sendResponse(response, 200, 'application/json', {
                success: true,
                data: ttsConfigs
            });
        } else {
            const result = await fetch(url, options);
            const voices = await result.json();
            let configs = {
                voices: voices,
                emotions: ['female_happy' ,
                    'female_sad' ,
                    'female_angry' ,
                    'female_fearful' ,
                    'female_disgust' ,
                    'female_surprised' ,
                    'male_happy' ,
                    'male_sad' ,
                    'male_angry' ,
                    'male_fearful' ,
                    'male_disgust' ,
                    'male_surprised']
            }
            ttsConfigs = JSON.parse(JSON.stringify(configs));
            Request.sendResponse(response, 200, 'application/json', {
                success: true,
                data: configs
            });
        }

    } catch (e) {
            Request.sendResponse(response, 500, 'application/json', {
            success: false,
            message: e.message
        });
    }
}

export { textToSpeech, listVoicesAndEmotions };
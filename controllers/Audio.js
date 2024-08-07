import fetch from "node-fetch";
import * as Request from '../utils/request.js';
function createErrorMessage(status, jsonResponse){
    let errorMessage = jsonResponse["error_message"];
    if(status === 401){
        errorMessage = "API KEY is missing or invalid";
    }
    return `${jsonResponse["error_id"]}: ${errorMessage}`;
}
async function textToSpeech(request, response){
    const url = "https://api.play.ht/api/v2/tts/stream";
    const options = {
        method: "POST",
        headers: {
            accept: "audio/mpeg",
            "content-type": "application/json",
            AUTHORIZATION: request.body.APIKey,
            "X-USER-ID": request.body.userId,
        },
        body: JSON.stringify({
            voice_engine: 'PlayHT2.0',
            text: request.body.prompt,
            voice: request.body.voice,
            output_format: "mp3",
            sample_rate: "44100",
            emotion: request.body.emotion,
            temperature: request.body.temperature || null,
            voice_guidance: request.body.voiceGuidance || null,
            style_guidance: request.body.styleGuidance || 20,
            speed: 1,
        }),
    };
    const result = await fetch(url, options);
    if(!result.ok) {
        let jsonResponse = await result.json();
        return Request.sendResponse(response, 500, 'application/json', {
            success: false,
            message: createErrorMessage(result.status, jsonResponse)
        });
    }

    result.body.pipe(response);

}
async function listVoices(request, response){
    const url = 'https://api.play.ht/api/v2/voices';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            AUTHORIZATION: request.body.APIKey,
            'X-USER-ID': request.body.userId
        }
    };
    try {
        const result = await fetch(url, options);
        let voices = await result.json();
        if(!result.ok){
            return Request.sendResponse(response, voices.status || 500, 'application/json', {
                success: false,
                message: createErrorMessage(result.status, voices)
            });
        }
        voices = voices.filter(voice => voice.voice_engine === 'PlayHT2.0');
        Request.sendResponse(response, 200, 'application/json', {
            success: true,
            data: voices
        });
    } catch (e) {
            Request.sendResponse(response, 500, 'application/json', {
            success: false,
            message: e.message
        });
    }
}
async function listEmotions(request, response){
    const emotions = [
        'female_happy' ,
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
    Request.sendResponse(response, 200, 'application/json', {
        success: true,
        data: emotions
    });
}
export { textToSpeech, listVoices, listEmotions };
import fetch from "node-fetch";
import * as Request from '../utils/request.js';
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
            message: `${jsonResponse["error_id"]}: ${jsonResponse["error_message"]}`
        });
    }

    result.body.pipe(response);

}
async function listVoicesAndEmotions(request, response){
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
        voices = voices.filter(voice => voice.voice_engine === 'PlayHT2.0');
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

        Request.sendResponse(response, 200, 'application/json', {
            success: true,
            data: configs
        });
    } catch (e) {
            Request.sendResponse(response, 500, 'application/json', {
            success: false,
            message: e.message
        });
    }
}

export { textToSpeech, listVoicesAndEmotions };
import fetch from "node-fetch";
import * as Request from '../utils/request.js';
function createErrorMessage(status, jsonResponse){
    let errorMessage = jsonResponse["error_message"];
    if(status === 401){
        errorMessage = "API KEY is missing or invalid";
    }
    return `${jsonResponse["error_id"]}: ${errorMessage}`;
}
async function generateLongAudio(request, clientResponse, prompt) {
    const options = {
        method: "POST",
        headers: {
            accept: "text/event-stream",
            "content-type": "application/json",
            AUTHORIZATION: request.body.APIKey,
            "X-USER-ID": request.body.userId,
        },
        body: JSON.stringify({
            voice_engine: 'PlayHT2.0',
            text: prompt,
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

    const eventStreamUrl = "https://api.play.ht/api/v2/tts";
    let response = await fetch(eventStreamUrl, options);
    let text = await response.text();
    let events = text.split('\r\n\r\n');
    let completedEvent = events[events.length - 2];
    let parts = completedEvent.split('\r\n');
    if(parts[0].startsWith("event:")){
        let data = parts[1].replace("data: ", "");
        let jsonData = JSON.parse(data);
        let audioResponse = await fetch(jsonData.url);
        if(!audioResponse.ok){
            let jsonData = await audioResponse.json();
            throw new Error(createErrorMessage(audioResponse.status, jsonData));
        }
        return await audioResponse.arrayBuffer();
    } else {
        throw new Error("Failed to generate audio");
    }

}
async function textToSpeech(request, response){
    let prompt = request.body.prompt;
    if(prompt.length > 2000){
        return Request.sendResponse(response, 400, 'application/json', {
            success: false,
            message: "Text is too long. Maximum length is 2000 characters"
        });
    }
    let arrayBuffer = await generateLongAudio(request, response, prompt);
    const audioBuffer = Buffer.from(arrayBuffer);
    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Content-Length', audioBuffer.length);
    response.end(audioBuffer);
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
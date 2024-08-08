import IAudioLLM from "../../../interfaces/IAudioLLM.js";
import fetch from "node-fetch";
class PlayHT extends IAudioLLM {
    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return "PlayHT";
    }

    createErrorMessage(status, jsonResponse) {
        let errorMessage = jsonResponse["error_message"];
        if (status === 401) {
            errorMessage = "API KEY is missing or invalid";
        }
        return `${jsonResponse["error_id"]}: ${errorMessage}`;
    }

    async generateAudio(configs) {
        const options = {
            method: "POST",
            headers: {
                accept: "text/event-stream",
                "content-type": "application/json",
                AUTHORIZATION: this.APIKey,
                "X-USER-ID": configs.userId,
            },
            body: JSON.stringify({
                voice_engine: 'PlayHT2.0',
                text: configs.prompt,
                voice: configs.voice,
                output_format: "mp3",
                sample_rate: "44100",
                emotion: configs.emotion,
                temperature: configs.temperature || null,
                voice_guidance: configs.voiceGuidance || null,
                style_guidance: configs.styleGuidance || 20,
                speed: 1,
            }),
        };
        // let errorData = {
        //     status: 429,
        //     message: "too many requests"
        // }
        // throw new Error(JSON.stringify(errorData));
        const eventStreamUrl = "https://api.play.ht/api/v2/tts";
        let response;
        try {
            response = await fetch(eventStreamUrl, options);
        } catch (e) {
            let errorData = {
                status: 500,
                message: e.message
            }
            throw new Error(JSON.stringify(errorData));
        }

        if (!response.ok) {
            let errorData = {
                status: response.status,
                message: this.createErrorMessage(response.status, await response.json())
            }
            throw new Error(JSON.stringify(errorData));
        }
        let text = await response.text();
        let events = text.split('\r\n\r\n');
        let completedEvent = events[events.length - 2];
        let parts = completedEvent.split('\r\n');
        if (parts[0].startsWith("event:")) {
            let data = parts[1].replace("data: ", "");
            let jsonData = JSON.parse(data);
            let audioResponse = await fetch(jsonData.url);
            if (!audioResponse.ok) {
                let errorData = {
                    status: audioResponse.status,
                    message: this.createErrorMessage(audioResponse.status, await response.json())
                }
                throw new Error(JSON.stringify(errorData));
            }
            return await audioResponse.arrayBuffer();
        } else {
            let errorData = {
                status: 500,
                message: "Failed to generate audio"
            }
            throw new Error(JSON.stringify(errorData));
        }
    }

    async textToSpeech(configs) {
        if (configs.prompt > 2000) {
            let errorData = {
                status: 400,
                message: "Text is too long. Maximum length is 2000 characters"
            }
            throw new Error(JSON.stringify(errorData));
        }
        return await this.generateAudio(configs);
    }

    async listVoices(configs) {
        const url = 'https://api.play.ht/api/v2/voices';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                AUTHORIZATION: this.APIKey,
                'X-USER-ID': configs.userId
            }
        };
        let response;
        try {
            response = await fetch(url, options);
        } catch (e) {
            throw new Error(JSON.stringify({
                status: 500,
                message: e.message
            }));
        }
        let voices = await response.json();
        if (!response.ok) {
            throw new Error(JSON.stringify({
                status: response.status,
                message: this.createErrorMessage(response.status, voices)
            }));
        }
        voices = voices.filter(voice => voice.voice_engine === 'PlayHT2.0');
        return voices;
    }

    async listEmotions() {
        return [
            'female_happy',
            'female_sad',
            'female_angry',
            'female_fearful',
            'female_disgust',
            'female_surprised',
            'male_happy',
            'male_sad',
            'male_angry',
            'male_fearful',
            'male_disgust',
            'male_surprised'];
    }
}

export default PlayHT;
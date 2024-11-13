import fetch from "node-fetch";

export default async function (modelInstance) {
    modelInstance.createErrorMessage = (status, jsonResponse) => {
        let errorMessage = jsonResponse["error_message"];
        if (status === 401) {
            errorMessage = "API KEY is missing or invalid";
        }
        return `${jsonResponse["error_id"]}: ${errorMessage}`;
    }
    modelInstance.generateAudio = async (configs) => {
        const options = {
            method: "POST",
            headers: {
                accept: "text/event-stream",
                "content-type": "application/json",
                AUTHORIZATION:  modelInstance.APIKey,
                "X-USER-ID": configs.userId,
            },
            body: JSON.stringify({
                voice_engine:  modelInstance.getModelName(),
                text: configs.prompt,
                voice: configs.voice,
                output_format: "mp3",
                sample_rate: "44100",
                emotion: configs.emotion,
                style_guidance: configs.styleGuidance || 20,
                speed: 1,
            }),
        };
        const eventStreamUrl = "https://api.play.ht/api/v2/tts/stream";
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
                message:  modelInstance.createErrorMessage(response.status, await response.json())
            }
            throw new Error(JSON.stringify(errorData));
        }
        return await response.arrayBuffer();
    }
    modelInstance.textToSpeech = async (configs) => {
        if (configs.prompt > 2000) {
            let errorData = {
                status: 400,
                message: "Text is too long. Maximum length is 2000 characters"
            }
            throw new Error(JSON.stringify(errorData));
        }
        const generateAudioTask = async () => {
            return await  modelInstance.generateAudio(configs);
        }
        return await  modelInstance.throttler.addTask(generateAudioTask);
    }
    modelInstance.listVoices = async (configs) => {
        const url = 'https://api.play.ht/api/v2/voices';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                AUTHORIZATION:  modelInstance.APIKey,
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
                message:  modelInstance.createErrorMessage(response.status, voices)
            }));
        }
        voices = voices.filter(voice => voice.voice_engine ===  modelInstance.getModelName());
        return voices;
    }
    modelInstance.listEmotions = () => {
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
            'male_surprised'
        ];
    }
}

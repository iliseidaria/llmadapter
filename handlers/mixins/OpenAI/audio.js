async function createOpenAIInstance(APIKey) {
    if (!APIKey) {
        const error = new Error("API key not provided");
        error.statusCode = 400;
        throw error;
    }
    const OpenAILib = (await import('openai')).default;
    return new OpenAILib({apiKey: APIKey});
}

export default async function (modelInstance) {

    modelInstance.generateAudioTask = async (configs) => {
        const OpenAI = await createOpenAIInstance(modelInstance.APIKey);
        try{
            const mp3 = await OpenAI.audio.speech.create({
                model: modelInstance.getModelName(),
                voice: configs.voice,
                input: configs.prompt,
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            return buffer;
        }catch (e){
            let errorData = {
                status: 500,
                message: e.message
            }
            throw new Error(JSON.stringify(errorData));
        }
    };
    modelInstance.textToSpeech = async (configs) => {
        return await modelInstance.throttler.addTask(async ()=>{
            return await modelInstance.generateAudioTask(configs);
        });
    }
    modelInstance.listEmotions = async () => {
        return [];
    }
    modelInstance.listVoices = async () => {
        return [{
            name: "alloy",
            id: "alloy",
            gender: "neutral",
            age: "adult"
            },
            {
                name: "ash",
                id: "ash",
                gender: "male",
                age: "adult"
            },
            {
                name: "coral",
                id: "coral",
                gender: "female",
                age: "young adult"
            },
            {
                name: "echo",
                id: "echo",
                gender: "male",
                age: "young adult"
            },
            {
                name: "fable",
                id: "fable",
                gender: "male",
                age: "young adult",
                accent: "british"
            },
            {
                name: "onyx",
                id: "onyx",
                gender: "male",
                age: "adult"
            },
            {
                name: "nova",
                id: "nova",
                gender: "female",
                age: "adult"
            },
            {
                name: "sage",
                id: "sage",
                gender: "female",
                age: "young adult"
            },
            {
                name: "shimmer",
                id: "shimmer",
                gender: "female",
                age: "adult"
            },
        ]
    }
}
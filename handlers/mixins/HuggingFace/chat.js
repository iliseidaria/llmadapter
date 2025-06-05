import {HfInference} from "@huggingface/inference";

function buildChatCompletionConfig(modelInstance, prompt, configs) {
    const {temperature, maxTokens, top_p, stop} = configs;
    return {
        model: modelInstance.getModelName(),
        messages: prompt,
        ...(temperature !== undefined ? {temperature} : {}),
        ...(maxTokens !== undefined ? {max_new_tokens: maxTokens} : {max_new_tokens: 1000}),
        ...(top_p !== undefined ? {top_p} : {}),
        ...(stop !== undefined ? {stop} : {}),
    };
}

export default async function (modelInstance) {
    const hf = new HfInference(modelInstance.APIKey);

    async function executeStandardCompletion(modelInstance, prompt) {
        const chatConfig = buildChatCompletionConfig(modelInstance, prompt, modelInstance.config);
        try {
            const response = await hf.chatCompletion(chatConfig);
            if (response.choices && response.choices[0].message) {
                return {message: response.choices[0].message.content, metadata: response};
            } else {
                throw new Error("Invalid chatCompletion response format.");
            }
        } catch (error) {
            console.error("Standard Completion Error:", error);
            throw error;
        }
    }

    async function executeStreamingCompletion(modelInstance, prompt, streamEmitter, chatHistory, configs) {
        try {
            const chatConfig = buildChatCompletionConfig(modelInstance, prompt, chatHistory, configs);
            let fullText = "";

            for await (const chunk of hf.chatCompletionStream(chatConfig)) {

                if (
                    chunk.choices &&
                    chunk.choices[0].delta &&
                    chunk.choices[0].delta.content
                ) {
                    const content = chunk.choices[0].delta.content;
                    fullText += content;
                    streamEmitter.emit('data', content);
                }
            }

            streamEmitter.emit('end', { fullMessage: fullText });
            return streamEmitter;
        } catch (error) {
            streamEmitter.emit('error', error);
            console.error("Error during streaming chat completion:", error);
            throw error;
        }
    }
    modelInstance.getChatResponse = async function (chat) {
        return await executeStandardCompletion(modelInstance, chat);
    };

    modelInstance.getChatStreamingResponse = async function (chat, streamEmitter) {
        return await executeStreamingCompletion(modelInstance, chat, streamEmitter);
    };

}

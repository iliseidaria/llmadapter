import {HfInference} from "@huggingface/inference";


function buildTextGenerationConfig(modelInstance, prompt, configs) {
    const {temperature, maxTokens, top_p, stop} = configs;
    return {
        inputs: prompt,
        model: modelInstance.getModelName(),
        parameters: {
            ...(temperature !== undefined ? {temperature} : {}),
            ...(maxTokens !== undefined ? {max_new_tokens: maxTokens} : {max_new_tokens: 1000}),
            ...(top_p !== undefined ? {top_p} : {}),
            ...(stop !== undefined ? {stop} : {}),
        },
    };
}
function buildChatCompletionConfig(modelInstance, prompt, configs) {
    const { temperature, maxTokens, top_p, stop } = configs;
    return {
        model: modelInstance.getModelName(),
        messages: [{ role: 'user', content: prompt }],
        ...(temperature !== undefined ? { temperature } : {}),
        ...(maxTokens !== undefined ? { max_tokens: maxTokens } : { max_tokens: 1000 }),
        ...(top_p !== undefined ? { top_p } : {}),
        ...(stop !== undefined ? { stop } : {}),
    };
}

export default async function (modelInstance) {
    const hf = new HfInference(modelInstance.APIKey);


    async function executeStandardCompletion(modelInstance, prompt, configs) {
        const chatConfig = buildChatCompletionConfig(modelInstance, prompt, configs);
        let response;
        try {
            response = await hf.chatCompletion(chatConfig);
            if (response.choices && response.choices[0].message) {
                return { message: response.choices[0].message.content, metadata: response };
            } else {
                throw new Error("Invalid chatCompletion response format.");
            }
        } catch (error) {
            const textGenConfig = buildTextGenerationConfig(modelInstance, prompt, configs);
            try {
                response = await hf.textGeneration(textGenConfig);
                if (response.generated_text) {
                    return { message: response.generated_text, metadata: response };
                } else if (Array.isArray(response) && response[0].generated_text) {
                    return { message: response.map(item => item.generated_text).join(''), metadata: response };
                } else {
                    throw new Error("Invalid textGeneration response format.");
                }
            } catch (textGenError) {
                throw textGenError;
            }
        }
    }

    async function executeStreamingCompletion(modelInstance, prompt,streamEmitter, configs) {
        const chatConfig = buildChatCompletionConfig(modelInstance, prompt, configs);
        let fullText = "";
        try {
            for await (const chunk of hf.chatCompletionStream(chatConfig)) {
                if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
                    fullText += chunk.choices[0].delta.content;
                    streamEmitter.emit('data', chunk.choices[0].delta.content);
                }
            }
            streamEmitter.emit('end', { fullMessage: fullText });
            return fullText;
        } catch (error) {
            const textGenConfig = buildTextGenerationConfig(modelInstance, prompt, configs);
            try {
                for await (const chunk of hf.textGenerationStream(textGenConfig)) {
                    if (chunk.generated_text) {
                        fullText += chunk.generated_text;
                    }
                }
                return fullText;
            } catch (textGenError) {
                throw textGenError;
            }
        }
    }

    modelInstance.getTextResponse = function (prompt, configs = {}) {
        return executeStandardCompletion(modelInstance, prompt, configs);
    };
    modelInstance.getTextStreamingResponse = function (prompt, streamEmitter, configs = {}) {
        return executeStreamingCompletion(modelInstance, prompt, streamEmitter, configs);
    };

    modelInstance.getTextConversationResponse = async function (prompt, chat, configs = {}) {
        let promptMessages = chat.map(message => JSON.stringify(message)).join('\n') + prompt;
        return await executeStandardCompletion(modelInstance, promptMessages, configs);
    }

}

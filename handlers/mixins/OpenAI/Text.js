async function createOpenAIInstance(APIKey) {
    if (!APIKey) {
        const error = new Error("API key not provided");
        error.statusCode = 400;
        throw error;
    }
    const OpenAILib = (await import('openai')).default;
    return new OpenAILib({apiKey: APIKey});
}

function buildLLMRequestConfig(modelInstance, prompt, configs) {
    const {variants, temperature, maxTokens, response_format, top_p, frequency_penalty, presence_penalty, stop} = configs;
    return {
        model: modelInstance.getModelName(),
        messages: prompt,
        ...(variants ? {n: variants} : {}),
        ...(temperature !== undefined ? {temperature} : {}),
        ...(maxTokens ? {max_tokens: maxTokens} : {}),
        ...(top_p !== undefined ? {top_p} : {}),
        ...(frequency_penalty !== undefined ? {frequency_penalty} : {}),
        ...(presence_penalty !== undefined ? {presence_penalty} : {}),
        ...(stop ? {stop} : {}),
        ...(response_format === "json" ? {response_format: {"type": "json_object"}} : {})
    };
}

const trimJSONMarkers = (string) => {
    const jsonStartMarkers = ['```json\n', '```json'];
    const jsonEndMarkers = ['```'];

    for (let marker of jsonStartMarkers) {
        if (string.startsWith(marker)) {
            string = string.slice(marker.length)
            break;
        }
    }

    for (let marker of jsonEndMarkers) {
        if (string.endsWith(marker)) {
            string = string.slice(0, -marker.length)
            break;
        }
    }
    return string;
}

async function ensureJSONResponseFormat(llmResponseArray, modelInstance, llmRequestFallback = false) {
    return await Promise.all(llmResponseArray.map(async llmResponse => {
        let trimmedResponse = trimJSONMarkers(llmResponse.trim());

        try {
            const parsedResponse = JSON.parse(trimmedResponse);
            return JSON.stringify(parsedResponse);
        } catch (error) {
            if (llmRequestFallback) {
                const prompt = `Please refactor the following response to be formatted strictly as JSON, without including any markdown or other delimiters. Ensure the JSON is valid and properly structured:\n\n${trimmedResponse}`;
                const response = await modelInstance.chat.completions.create(
                    buildLLMRequestConfig(modelInstance, prompt, {response_format: "json"})
                );
                return trimJSONMarkers(response.choices[0].message.content);
            }
            return llmResponse;
        }
    }));
}

export default async function (modelInstance) {
    const OpenAI = await createOpenAIInstance(modelInstance.APIKey);

    async function executeStandardCompletion(OpenAI, modelInstance, prompt, configs) {
        const LLMRequestConfig = buildLLMRequestConfig(modelInstance, prompt, configs);
        const response = await OpenAI.chat.completions.create(LLMRequestConfig);
        const messages = response.choices.map(choice => choice.message.content);
        delete response.choices;

        if (configs.response_format === "json") {
            return {
                messages: await ensureJSONResponseFormat(messages, OpenAI, true),
                metadata: response
            }
        }
        return { messages, metadata: response };
    }

    async function executeStreamingCompletion(OpenAI, modelInstance, prompt, streamEmitter, configs) {
        const LLMRequestConfig = buildLLMRequestConfig(modelInstance, prompt, configs);
        const stream = await OpenAI.beta.chat.completions.stream(LLMRequestConfig);

        (async () => {
            for await (const chunk of stream) {
                const content = trimJSONMarkers(chunk.choices[0]?.delta?.content || '');
                streamEmitter.emit('data', content);
            }
            const response = await stream.finalChatCompletion();
            const messages = response.choices.map(choice => choice.message.content);
            delete response.choices;
            const trimmedMessages = messages.map(trimJSONMarkers);
            streamEmitter.emit('end', { fullMessage: trimmedMessages, metadata: response });
        })();

        return streamEmitter;
    }

    modelInstance.getTextResponse = function (prompt, configs = {}) {
        prompt = [{role: 'user', content: prompt}];
        return executeStandardCompletion(OpenAI, modelInstance, prompt, configs);
    };

    modelInstance.getTextConversationResponse = function (prompt, messagesQueue, configs = {}) {
        const combinedPrompt = messagesQueue.concat({role: 'user', content: prompt});
        return executeStandardCompletion(OpenAI, modelInstance, combinedPrompt, configs);
    };

    modelInstance.getTextStreamingResponse = function (prompt, streamEmitter, configs = {}) {
        prompt = [{role: 'user', content: prompt}];
        return executeStreamingCompletion(OpenAI, modelInstance, prompt, streamEmitter, configs);
    };

    modelInstance.getTextConversationStreamingResponse = function (prompt, messagesQueue, streamEmitter, configs = {}) {
        const combinedPrompt = messagesQueue.concat({role: 'user', content: prompt});
        return executeStreamingCompletion(OpenAI, modelInstance, combinedPrompt, streamEmitter, configs);
    };
}

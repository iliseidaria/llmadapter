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
    const {variants, temperature, maxTokens, response_format} = configs;
    return {
        model: modelInstance.getModelName(),
        messages: prompt,
        ...(variants ? {n: variants} : {}),
        ...(temperature ? {temperature} : {}),
        ...(maxTokens ? {max_tokens: maxTokens} : {}),
        ...(response_format === "json" ? {response_format: {"type": "json_object"}} : {})
    };
}


export default async function (modelInstance) {
    const OpenAI = await createOpenAIInstance(modelInstance.APIKey);

    async function executeStandardCompletion(OpenAI, modelInstance, prompt, configs) {
        const LLMRequestConfig = buildLLMRequestConfig(modelInstance, prompt, configs);
        const response = await OpenAI.chat.completions.create(LLMRequestConfig);
        const messages = response.choices.map(choice => choice.message.content);
        delete response.choices;
        return {
            messages: messages,
            metadata: response
        };
    }

    async function executeStreamingCompletion(OpenAI, modelInstance, prompt, streamEmitter, configs) {
        const LLMRequestConfig = buildLLMRequestConfig(modelInstance, prompt, configs);
        const stream = await OpenAI.beta.chat.completions.stream(LLMRequestConfig);

        (async () => {
            for await (const chunk of stream) {
                streamEmitter.emit('data', chunk.choices[0]?.delta?.content || '');
            }
            const response = await stream.finalChatCompletion();
            const messages = response.choices.map(choice => choice.message.content);
            delete response.choices;
            streamEmitter.emit('end', {fullMessage: messages, metadata: response});
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


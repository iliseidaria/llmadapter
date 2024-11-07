import {HfInference} from "@huggingface/inference";

function buildLLMRequestConfig(modelInstance, prompt, configs) {
    const {temperature, maxTokens, top_p, stop} = configs;
    return {
        model: modelInstance.getModelName(),
        messages: [{role: 'user', content: prompt}],
        ...(temperature !== undefined ? {temperature} : {}),
        ...(maxTokens !== undefined ? {max_new_tokens: maxTokens} : {max_new_tokes: 1000}),
        ...(top_p !== undefined ? {top_p} : {}),
        ...(stop !== undefined ? {stop} : {}),
    };
}

async function ensureJSONResponseFormat(llmResponse, llmRequestFallback = false) {
    const trimmedResponse = llmResponse.trim();

    try {
        const parsedResponse = JSON.parse(trimmedResponse);
        return JSON.stringify(parsedResponse);
    } catch (error) {
        if (llmRequestFallback) {
            return llmResponse;
        }
        return llmResponse;
    }
}

export default async function (modelInstance) {
    const hf = new HfInference(modelInstance.APIKey);

    async function executeStandardCompletion(modelInstance, prompt, configs) {
        const LLMRequestConfig = buildLLMRequestConfig(modelInstance, prompt, configs);
        let response;
        try {
            response = await hf.chatCompletion({
                ...LLMRequestConfig,
            });
        } catch (error) {
             response = await hf.textGeneration({
                ...LLMRequestConfig,
            });
        }
        const message = response.choices[0].message.content;
        const metadata = response;
        return {message, metadata};
}

modelInstance.getTextResponse = function (prompt, configs = {}) {
    return executeStandardCompletion(modelInstance, prompt, configs);
};
}

import { HfInference } from "@huggingface/inference";

function buildLLMRequestConfig(modelInstance, prompt, configs) {
    const { temperature, maxTokens, top_p, stop } = configs;
    return {
        model: modelInstance.getModelName(),
        messages: [{ role: 'user', content: prompt }],
        ...(temperature !== undefined ? { temperature } : {}),
        ...(maxTokens !== undefined ? { max_new_tokens: maxTokens } : {}),
        ...(top_p !== undefined ? { top_p } : {}),
        ...(stop !== undefined ? { stop } : {}),
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

        try {
            const response = await hf.chatCompletion({
                ...LLMRequestConfig,
            });

            const message = response.generated_text;
            const messages = [message];
            const metadata = response;

            if (configs.response_format === "json") {
                return {
                    messages: [await ensureJSONResponseFormat(message, true)],
                    metadata,
                };
            }

            return { messages, metadata };
        } catch (error) {
            throw new Error(`Error in executeStandardCompletion: ${error.message}`);
        }
    }

    modelInstance.getTextResponse = function (prompt, configs = {}) {
        return executeStandardCompletion(modelInstance, prompt, configs);
    };
}

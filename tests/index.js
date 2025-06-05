const fs = require('fs');
const data = require('../../apihub-component-utils/data.js');

const LLMFactory = require('../handlers/factory/LLMFactory.js');
const streamEmitter = require('../handlers/utils/streamEmitter.js');


const OpenAIAPIKey = "";
const AnthropicAPIKey = "";
const GoogleAPIKey = "";

const GPT3_Turbo = LLMFactory.createLLM("GPT-3.5-Turbo", OpenAIAPIKey, {}, "openAI_Text");
const GPT4 = LLMFactory.createLLM("GPT-4", OpenAIAPIKey, {}, "openAI_Text");
const GPT4_Turbo = LLMFactory.createLLM("GPT-4-Turbo", OpenAIAPIKey, {}, "openAI_Text");
const GPT4o = LLMFactory.createLLM("GPT-4o", OpenAIAPIKey, {}, "openAI_Text");
/*const Claude2=LLMFactory.createLLM("Claude-2", {}, AnthropicAPIKey, "anthropic");
const Claude3=LLMFactory.createLLM("Claude-3", {}, AnthropicAPIKey, "anthropic");

const Gemini= LLMFactory.createLLM("Gemini", {}, GoogleAPIKey, "google");*/


(async () => {
    const runTest = async (testSuite, LLM, testName) => {
        await (testSuites[testSuite][testName](LLM));
    }

    const testSuites = {
        openAI: {
            response: async (LLM) => {
                try {
                    const response = await LLM.getTextResponse("Hello, how are you?", {
                        variants: 1, temperature: 0.5, maxTokens: 300
                    });
                    console.log(response);
                } catch (error) {
                    console.error('Error during response:', error);
                }
            },
            responseWithVariants: async (LLM) => {
                try {
                    const response = await LLM.getTextResponse("Hello, how are you?", {
                        variants: 3, temperature: 0.5, maxTokens: 300
                    });
                    console.log(response);
                } catch (error) {
                    console.error('Error during response with variants:', error);
                }
            },
            responseWithHistory: async (LLM) => {
                try {
                    const response = await LLM.getTextConversationResponse("What was my first message?", [
                        {role: 'user', content: "Hello, how are you?"},
                        {role: 'assistant', content: "I'm fine, thank you."},
                    ]);
                    console.log(response);
                } catch (error) {
                    console.error('Error during response with history:', error);
                }
            },
            responseWithStreaming: async (LLM) => {
                try {
                    const stream = await LLM.getTextStreamingResponse("Hello, how are you?", streamEmitter, {});
                    streamEmitter.on('data', (data) => {
                        console.log(data);
                    })

                } catch (error) {
                    console.error('Error during response with streaming:', error);
                }
            },
           responseWithStreamingHistory: async (LLM) => {
                try {
                    const stream = await LLM.getTextConversationStreamingResponse("What was my first message?", [
                        {role: 'user', content: "Hello, how are you?"},
                        {role: 'assistant', content: "I'm fine, thank you."},
                    ], streamEmitter, {});
                    streamEmitter.on('data', (data) => {
                        console.log(data);
                    })

                } catch (error) {
                    console.error('Error during response with streaming history:', error);
                }
            },
            generateImage: async (LLM) => {
                try {
                    const response = await LLM.generateImage("", {
                        quality: "standard"
                    });
                    console.log(response);
                } catch (error) {
                    console.error('Error during image generation:', error);
                }
            },
            generateImageVariants: async (LLM) => {
                try {
                    const image = fs.createReadStream('./download.png')
                    const response = await LLM.generateImageVariants(image, {
                        variants: 3,
                        size: "256x256",
                        response_format: "b64_json"
                    });
                    console.log(response);
                } catch (error) {
                    console.error('Error during image generation with variants:', error);
                }
            }
        },
        anthropic: {
            response: async (LLM) => {
                try {
                    const response = await LLM.getResponse({role: "user", content: "Hello, Claude"}, {
                        temperature: 0.5, maxTokens: 300
                    });
                    console.log(response);
                } catch (error) {
                    console.error('Error during response:', error);
                }
            }
        },
        google: {
            response: async (LLM) => {
                try {
                    const response = await LLM.getResponse("Hello, how are you?", {});
                    console.log(response);
                } catch (error) {
                    console.error('Error during response:', error);
                }
            }
        }
    }

    await runTest("openAI", GPT4o, "responseWithStreamingHistory");


})();

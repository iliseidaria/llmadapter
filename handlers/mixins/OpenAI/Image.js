import { fillTemplate } from '../../utils/data.js';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the JSON file
const promptRevisionOverrideTemplatePath = path.join(__dirname, '../../models/image/DALL-E-3/promptRevisionOverrideTemplate.json');
const promptRevisionOverrideTemplate = await fsPromises.readFile(promptRevisionOverrideTemplatePath, 'utf-8').then(JSON.parse);

async function createOpenAIInstance(apiKey) {
    if (!apiKey) {
        const error = new Error("API key not provided");
        error.statusCode = 400;
        throw error;
    }
    const OpenAILib = (await import('openai')).default;
    return new OpenAILib({ apiKey });
}

export default async function (modelInstance) {
    const OpenAI = await createOpenAIInstance(modelInstance.apiKey);

    modelInstance.generateImage = async function (prompt, configs) {
        const response = await OpenAI.images.generate({
            model: modelInstance.getModelName(),
            prompt: fillTemplate(promptRevisionOverrideTemplate.prompt, { prompt: prompt }),
            ...(configs.size ? { size: configs.size } : {}),
            ...(configs.quality ? { quality: configs.quality } : {}),
            n: configs.variants || 1,
        });
        const image = response.data[0].url;
        delete response.data[0].url;
        return {
            image: image,
            metadata: response.data[0]
        };
    };

    modelInstance.generateImageVariants = async function (imageReadStream, configs) {
        const response = await OpenAI.images.createVariation({
            model: "dall-e-2",
            image: imageReadStream,
            ...(configs.size ? { size: configs.size } : {}),
            ...(configs.variants ? { n: configs.variants } : {}),
            ...(configs.response_format ? { response_format: configs.response_format } : {}),
        });
        return response;
    };
}

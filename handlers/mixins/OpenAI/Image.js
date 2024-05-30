import {fillTemplate} from '../../utils/data.js';
import fsPromises from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the JSON file
const promptRevisionOverrideTemplatePath = path.join(__dirname, '../../models/image/DALL-E-3/promptRevisionOverrideTemplate.json');
const promptRevisionOverrideTemplate = await fsPromises.readFile(promptRevisionOverrideTemplatePath, 'utf-8').then(JSON.parse);

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
    const OpenAI = await createOpenAIInstance(modelInstance.APIKey);

    modelInstance.generateImage = async function (prompt, configs) {
        const response = await OpenAI.images.generate({
            model: modelInstance.getModelName(),
            prompt: fillTemplate(promptRevisionOverrideTemplate.prompt, {prompt: prompt}),
            ...(configs.size ? {size: configs.size} : {}),
            ...(configs.quality ? {quality: configs.quality} : {}),
            n: parseInt(configs.variants) || 1,
            style: configs.style || "vivid",
            response_format: configs.responseFormat || "url",
            quality: configs.quality || "standard",
        });
        let images = []
        for(let imageObj of response.data){
            images.push(imageObj.url || imageObj.b64_json);
        }
        return images;
    };
}

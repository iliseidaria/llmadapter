import {fillTemplate} from '../../utils/data.js';
import fsPromises from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {generateId, generateRefWithSignature, webhookURL} from "../../../controllers/Util.js";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptRevisionOverrideTemplatePath = path.join(__dirname, 'promptRevisionOverrideTemplate.json');
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
    modelInstance.generateImage = async (prompt, configs) => {
        let imagesMetadata = [];
        for (let i = 0; i < parseInt(configs.variants); i++) {
            let imageId = `${configs.spaceId}_${generateId(8)}`;
            imagesMetadata.push({
                id: imageId,
                userId: configs.userId,
                prompt: prompt,
                createdAt: new Date().toISOString()
            });
        }
        OpenAI.images.generate({
            model: modelInstance.getModelName(),
            prompt: fillTemplate(promptRevisionOverrideTemplate.prompt, {prompt: prompt}),
            ...(configs.size ? {size: configs.size} : {}),
            ...(configs.quality ? {quality: configs.quality} : {}),
            n: parseInt(configs.variants) || 1,
            style: configs.style || "vivid",
            response_format: configs.responseFormat || "url",
            quality: configs.quality || "standard",
        }).then((response) => {
            const refObj = generateRefWithSignature(configs.webhookSecret);
            refObj.userId = configs.userId;
            for (let i = 0; i < response.data.length; i++) {
                refObj.objectId = imagesMetadata[i].id;
                fetch(webhookURL, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        ref: JSON.stringify(refObj),
                        status: "DONE",
                        imageData: response.data[i].url || response.data[i].b64_json
                    }),
                });
            }
        });
        return imagesMetadata;
    };

    modelInstance.generateImageVariants = async (imageReadStream, configs) => {
        return (await OpenAI.images.createVariation({
            model: modelInstance.getModelName(),
            image: imageReadStream,
            ...(configs.size ? {size: configs.size} : {}),
            ...(configs.variants ? {n: configs.variants} : {}),
            ...(configs.response_format ? {response_format: configs.response_format} : {}),
        }));
    }
}

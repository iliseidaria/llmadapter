import IImageLLM from "../../../interfaces/IImageLLM.js";
import {fillTemplate} from "../../../utils/data.js";
import path from "path";
import fsPromises from "fs/promises";
import {fileURLToPath} from "url";
import fetch from "node-fetch";
import {generateId, generateRefWithSignature, webhookURL} from "../../../../controllers/Util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promptRevisionOverrideTemplatePath = path.join(__dirname, './promptRevisionOverrideTemplate.json');
const promptRevisionOverrideTemplate = await fsPromises.readFile(promptRevisionOverrideTemplatePath, 'utf-8').then(JSON.parse);

class DALLE3 extends IImageLLM {
    static modelName = "dall-e-3";

    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return DALLE3.modelName;
    }

    async createOpenAIInstance(APIKey) {
        if (!APIKey) {
            const error = new Error("API key not provided");
            error.statusCode = 400;
            throw error;
        }
        const OpenAILib = (await import('openai')).default;
        return new OpenAILib({apiKey: APIKey});
    }

    async generateImage(prompt, configs) {
        const OpenAI = await this.createOpenAIInstance(this.APIKey);
        let variants = parseInt(configs.variants)
        let imagesMetadata = [];
        for (let i = 0; i < variants; i++) {
            let imageId = `${configs.spaceId}_${generateId(8)}`;
            imagesMetadata.push({
                id: imageId,
                userId: configs.userId,
                prompt: prompt,
                createdAt: new Date().toISOString()
            });
            OpenAI.images.generate({
                model: DALLE3.modelName,
                prompt: fillTemplate(promptRevisionOverrideTemplate.prompt, {prompt: prompt}),
                ...(configs.size ? {size: configs.size} : {}),
                ...(configs.quality ? {quality: configs.quality} : {}),
                n: 1,
                style: configs.style || "vivid",
                response_format: configs.responseFormat || "url",
                quality: configs.quality || "standard",
            }).then(async (response) => {
                const refObj = generateRefWithSignature(configs.webhookSecret);
                refObj.userId = configs.userId;
                refObj.imageId = imageId;
                fetch(webhookURL, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        imageId: imageId,
                        response: response,
                        status: "DONE",
                        ref: JSON.stringify(refObj),
                        imageData: response.data[0].url || response.data[0].b64_json,
                    }),
                });
            });
        }
        return imagesMetadata;
    };
}

export default DALLE3;
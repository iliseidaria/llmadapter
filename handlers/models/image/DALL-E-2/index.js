import IImageLLM from "../../../interfaces/IImageLLM.js";
import {fillTemplate} from "../../../utils/data.js";
import fsPromises from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promptRevisionOverrideTemplatePath = path.join(__dirname, '../DALL-E-3/promptRevisionOverrideTemplate.json');
const promptRevisionOverrideTemplate = await fsPromises.readFile(promptRevisionOverrideTemplatePath, 'utf-8').then(JSON.parse);

class DALLE2 extends IImageLLM{
    static modelName="dall-e-2";
    constructor(APIKey,config) {
        super(APIKey,config);
    }
    getModelName(){
        return DALLE2.modelName;
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
        const response = await OpenAI.images.generate({
            model: DALLE2.modelName,
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
    async generateImageVariants(imageReadStream, configs) {
        const OpenAI = await this.createOpenAIInstance(this.APIKey);
        const response = await OpenAI.images.createVariation({
            model: "dall-e-2",
            image: imageReadStream,
            ...(configs.size ? {size: configs.size} : {}),
            ...(configs.variants ? {n: configs.variants} : {}),
            ...(configs.response_format ? {response_format: configs.response_format} : {}),
        });
        return response;
    };
}
export default DALLE2;
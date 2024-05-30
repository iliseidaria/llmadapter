import IImageLLM from "../../../interfaces/IImageLLM.js";
import {fillTemplate} from "../../../utils/data.js";
import path from "path";
import fsPromises from "fs/promises";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promptRevisionOverrideTemplatePath = path.join(__dirname, './promptRevisionOverrideTemplate.json');
const promptRevisionOverrideTemplate = await fsPromises.readFile(promptRevisionOverrideTemplatePath, 'utf-8').then(JSON.parse);

class DALLE3 extends IImageLLM{
    static modelName="dall-e-3";
    constructor(APIKey,config) {
        super(APIKey,config);
    }
    getModelName(){
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
        let images = [];
        for(let i=0;i<variants;i++){
            const response = await OpenAI.images.generate({
                model: DALLE3.modelName,
                prompt: fillTemplate(promptRevisionOverrideTemplate.prompt, {prompt: prompt}),
                ...(configs.size ? {size: configs.size} : {}),
                ...(configs.quality ? {quality: configs.quality} : {}),
                n: 1,
                style: configs.style || "vivid",
                response_format: configs.responseFormat || "url",
                quality: configs.quality || "standard",
            });
            images.push(response.data[0].url || response.data[0].b64_json);
        }

        return images;
    };
}
export default DALLE3;
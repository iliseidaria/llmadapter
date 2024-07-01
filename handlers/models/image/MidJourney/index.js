import IImageLLM from "../../../interfaces/IImageLLM.js";
import fetch from "node-fetch";
import {generateRefWithSignature, webhookURL, generateId} from "../../../../controllers/Util.js";
class MidJourney extends IImageLLM {
    constructor(APIKey, config) {
        super(APIKey, config);
        this.result = "";
    }

    getModelName() {
    }

    async generateImage(prompt, configs) {
        const url = "https://api.mymidjourney.ai/api/v1/midjourney/imagine";
        const refObj = generateRefWithSignature(configs.webhookSecret);
        refObj.imageId = `${configs.spaceId}_${generateId(8)}`;
        refObj.userId = configs.userId;
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${this.APIKey}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                webhookOverride: webhookURL,
                ref: JSON.stringify(refObj),
            }),
        };

        const response = await fetch(url, options);
        const task = await response.json();
        if (!task.success || task.error) {
            throw new Error("API call: " + task.error + " " + task.message);
        }
        task.imageId = refObj.imageId;
        return task;
    };
    async editImage(configs) {
        const url = "https://api.mymidjourney.ai/api/v1/midjourney/button";
        const refObj = generateRefWithSignature(configs.webhookSecret);
        refObj.imageId = configs.imageId;
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${this.APIKey}`,
            },
            body: JSON.stringify({
                messageId: configs.messageId,
                button: configs.action,
                webhookOverride: webhookURL,
                ref: JSON.stringify(refObj),
            }),
        };
        const response = await fetch(url, options);
        const task = await response.json();
        if (!task.success || task.error) {
            throw new Error("API call: " + task.error + " " + task.message);
        }
        task.clientId = refObj.clientId;
        return task;
    }
}

export default MidJourney;
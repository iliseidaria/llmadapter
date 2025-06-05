import {generateId, generateRefWithSignature, webhookURL} from "../../../controllers/Util.js";
import fetch from "node-fetch";

export default async function (modelInstance) {
    modelInstance.generateImage = async (prompt, configs) => {
        const url = "https://api.mymidjourney.ai/api/v1/midjourney/imagine";
        const refObj = generateRefWithSignature(configs.webhookSecret);
        refObj.objectId = `${configs.spaceId}_${generateId(8)}`;
        refObj.userId = configs.userId;
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${modelInstance.APIKey}`,
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
        return {
            id: refObj.objectId,
            userId: refObj.userId,
            prompt: prompt,
            createdAt: new Date().toISOString(),
            messageId: task.messageId,
            buttons: []
        }
    };
    modelInstance.editImage = async (configs) => {
        const url = "https://api.mymidjourney.ai/api/v1/midjourney/button";
        const refObj = generateRefWithSignature(configs.webhookSecret);
        refObj.objectId = `${configs.spaceId}_${generateId(8)}`;
        refObj.userId = configs.userId;
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${modelInstance.APIKey}`,
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
        return {
            id: refObj.objectId,
            userId: refObj.userId,
            createdAt: new Date().toISOString(),
            messageId: task.messageId,
            buttons: []
        }
    }
}

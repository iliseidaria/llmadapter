import {generateRefWithSignature, webhookURL} from "../../../controllers/Util.js";

export default async function (modelInstance) {
    modelInstance.lipsync = async () => {
        const refObj = generateRefWithSignature(modelInstance.config.webHookData.webhookSecret);
        refObj.type = "video";
        refObj.taskId = modelInstance.config.webHookData.taskId;

        const whURL = webhookURL + `?ref=${encodeURIComponent(JSON.stringify(refObj))}`;
        const requestBody = {
            input: [{
                type: "audio",
                url: modelInstance.config.audioUrl
            },
                {
                    type: "video",
                    url: modelInstance.config.videoUrl
                }],
            fps: 24,
            output_format: "mp4",
            output_resolution: "1280x720",
            webhookUrl: whURL,
            model: modelInstance.getModelName(),
        };

        const response = await fetch('https://api.sync.so/v2/generate', {
            method: 'POST',
            headers: {
                accept: "application/json",
                "x-api-key": modelInstance.APIKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        if (response.ok) {
            const data = await response.json();
            return refObj.objectId;
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    }
}

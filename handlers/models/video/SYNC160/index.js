import IVideoLLM from "../../../interfaces/IVideoLLM.js";
import {generateRefWithSignature, webhookURL} from "../../../../controllers/Util.js";
import Throttler from "../../../../utils/Throttler.js";

class SYNC160 extends IVideoLLM {
    static modelName = "sync-1.7.1";

    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return SYNC160.modelName;
    }

    async lipsync() {
        const refObj = generateRefWithSignature(this.config.webHookData.webhookSecret);
        refObj.type = "video";
        refObj.taskId = this.config.webHookData.taskId;

        const whURL = webhookURL + `?ref=${encodeURIComponent(JSON.stringify(refObj))}`;
        const requestBody = {
            input:[{
                type: "audio",
                url: this.config.audioUrl
            },
            {
                type: "video",
                url: this.config.videoUrl
            }],
            fps: 24,
            output_format: "mp4",
            output_resolution: "1280x720",
            webhookUrl: whURL,
            model: this.getModelName(),
        };

        const response = await fetch('https://api.sync.so/v2/generate', {
            method: 'POST',
            headers: {
                accept: "application/json",
                "x-api-key": this.APIKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        if (response.ok) {
            const data = await response.json();
            //return data.id
            return refObj.objectId;
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    }
}

const SyncLabsHTThrottler = new Throttler(10, 6000);
export {SYNC160 as instance, SyncLabsHTThrottler as throttler};

import IVideoLLM from "../../../interfaces/IVideoLLM.js";
import {generateId, generateRefWithSignature, webhookURL} from "../../../../controllers/Util.js";
import Throttler from "../../../../utils/Throttler.js";
class SYNC160 extends IVideoLLM {
    static modelName = "sync-1.6.0";

    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return SYNC160.modelName;
    }

    async lipsync() {
        const refObj = generateRefWithSignature(this.config.webhookSecret);
        refObj.objectId = `${this.config.spaceId}_${generateId(8)}`;
        refObj.userId = this.config.userId;
        refObj.type="video";

        const whURL= webhookURL+`?ref=${encodeURIComponent(JSON.stringify(refObj))}`;
        const requestBody = {
            audioUrl: this.config.audioURL,
            videoUrl: this.config.videoURL,
            synergize: true,
            webhookUrl: whURL,
            model: this.getModelName(),
        };

        const response = await fetch('https://api.synclabs.so/lipsync', {
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
            return data.id
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    }
}
const SyncLabsHTThrottler = new Throttler(10, 6000);
export {SYNC160 as instance, SyncLabsHTThrottler as throttler};

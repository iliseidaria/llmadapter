import IImageLLM from "../../../interfaces/IImageLLM.js";
import fetch from "node-fetch";


class MidJourney extends IImageLLM{
    constructor(APIKey,config) {
        super(APIKey,config);
    }
    getModelName(){
    }
    async generateImage(prompt, configs) {
        const url = "https://api.mymidjourney.ai/api/v1/midjourney/imagine";
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${this.APIKey}`,
            },
            body: JSON.stringify({
               prompt: prompt,
            }),
        };

        const response = await fetch(url, options);
        const task = await response.json();
        if(!task.success){
            return task;
        }
        return await this.getImageStatus(task.messageId);

    };
    getImageStatus(messageId){
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const status = await fetch(`https://api.mymidjourney.ai/api/v1/midjourney/message/${messageId}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${this.APIKey}`,
                        },
                    });
                    const imageObj = await status.json();
                    if (imageObj.status === "DONE") {
                        clearInterval(intervalId);
                        resolve(imageObj);
                    }
                } catch (e) {
                    reject(e);
                }
            }, 3000);
        });
    }
}
export default MidJourney;
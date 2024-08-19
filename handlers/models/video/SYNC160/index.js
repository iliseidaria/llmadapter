import IVideoLLM from "../../../interfaces/IVideoLLM.js";
import Throttler from "../../../../utils/Throttler.js";

class SYNC160 extends IVideoLLM {
    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return "SYNC160";
    }
    async lipSync(configs){

    }
}

const playHTThrottler = new Throttler(10, 6000);
export {SYNC160 as instance, playHTThrottler as throttler};
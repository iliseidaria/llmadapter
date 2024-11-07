import  ITextLLM from "../../../interfaces/ITextLLM.js";

class O1MINI extends ITextLLM {
    static modelName = "o1-mini";
    constructor(APIKey,config) {
        super(APIKey,config);
    }
    getModelName() {
        return O1MINI.modelName;
    }

}

export default O1MINI;

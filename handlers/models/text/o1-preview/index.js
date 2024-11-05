import  ITextLLM from "../../../interfaces/ITextLLM.js";

class O1PREVIEW extends ITextLLM {
    static modelName = "o1-preview";
    constructor(APIKey,config) {
        super(APIKey,config);
    }
    getModelName() {
        return O1PREVIEW.modelName;
    }

}

export default O1PREVIEW;

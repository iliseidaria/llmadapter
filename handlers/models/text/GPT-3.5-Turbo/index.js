import  ITextLLM from "../../../interfaces/ITextLLM.js";

class GPT3_5 extends ITextLLM {
    static modelName = "gpt-3.5-turbo";
    constructor(APIKey,config) {
        super(APIKey,config);
    }

    getModelName() {
        return GPT3_5.modelName;
    }

}

export default GPT3_5;

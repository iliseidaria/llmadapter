import ITextLLM from "../../../interfaces/ITextLLM.js";

class GPT4Turbo extends ITextLLM {
    static modelName = "gpt-4-turbo";
    constructor(APIKey,config) {
        super(APIKey,config);
    }

    getModelName() {
        return GPT4Turbo.modelName;
    }

}

export default  GPT4Turbo;

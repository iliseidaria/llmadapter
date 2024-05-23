import ITextLLM from "../../../interfaces/ITextLLM.js";

class Gemini extends ITextLLM {
    static modelName = "gemini-pro";
    constructor(APIKey,config) {
        super(APIKey,config);
    }

    getModelName() {
        return Gemini.modelName;
    }

}

export default Gemini;

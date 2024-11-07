import ITextLLM from "../../../interfaces/ITextLLM.js";

class Qwen extends ITextLLM {
    static modelName = "Qwen/Qwen2.5-72B-Instruct";

    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return Qwen.modelName;
    }
}

export default Qwen;

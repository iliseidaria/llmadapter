class TextLLM {
    constructor(APIKey, config,modelName) {
        //TODO APIKey existence validation should be done at controller level to make it more efficient
        if (!APIKey) {
            const error = new Error("APIKey is required")
            error.statusCode = 400
            throw error
        }
        if (config === undefined) {
            const error = new Error("config is required")
            error.statusCode = 400
            throw error
        }
        this.APIKey = APIKey;
        this.config = config;
        this.modelName=modelName;
    }
    getModelName() {
        return this.modelName;
    }
}

export default TextLLM;

class ITextLLM {
    constructor(APIKey, config) {
        if (new.target === ITextLLM) {
            const error = new Error("Cannot construct Interface instances directly")
            error.statusCode = 500
            throw error
        }
        if (this.getModelName === undefined) {
            const error = new Error("Classes extending ITextLLM must implement getModelName method")
            error.statusCode = 500
            throw error

        }
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
    }
}

export default ITextLLM;
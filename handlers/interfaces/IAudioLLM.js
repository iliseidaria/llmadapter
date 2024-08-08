class IAudioLLM{
    constructor(APIKey,config){
        if(new.target===IAudioLLM){
            const error = new Error("Cannot construct Interface instances directly")
            error.statusCode = 500
            throw error
        }
        if(this.getModelName===undefined){
            const error = new Error("Classes extending IImageLLM must implement getModelName method")
            error.statusCode = 500
            throw error
        }
        if(config===undefined){
            const error = new Error("config is required")
            error.statusCode = 400
            throw error
        }
        if(APIKey===undefined){
            if(config.method === "listEmotions"){
                this.config=config;
                return;
            }
            const error = new Error("APIKey is required")
            error.statusCode = 400
            throw error
        }

        this.APIKey=APIKey;
        this.config=config;
    }
}
export default IAudioLLM;
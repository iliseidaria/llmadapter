class AudioLLM{
    constructor(APIKey,config,modelName){
        if(!APIKey){
            if(config.method === "listEmotions"){
                this.config=config;
                return this;
            }
            const error = new Error("APIKey is required")
            error.statusCode = 400
            throw error
        }
        if(config===undefined){
            const error = new Error("config is required")
            error.statusCode = 400
            throw error
        }
        this.APIKey=APIKey;
        this.config=config;
        this.modelName=modelName;
    }
    getModelName() {
        return this.modelName;
    }
}
export default AudioLLM;

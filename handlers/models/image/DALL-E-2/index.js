import IImageLLM from "../../../interfaces/IImageLLM.js";

class DALLE2 extends IImageLLM{
    static modelName="dall-e-2";
    constructor(APIKey,config) {
        super(APIKey,config);
    }
    getModelName(){
        return DALLE2.modelName;
    }
}
export default DALLE2;
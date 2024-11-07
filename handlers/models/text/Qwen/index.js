import ITextLLM from "../../../interfaces/ITextLLM.js";

class Qwen extends ITextLLM {
    static modelName = "Qwen/Qwen2.5-72B-Instruct"; //useless, as the output tokens are too low
    //static modelName = "mistralai/Mistral-7B"; //does not exist
    //static modelName="meta-llama/Llama-3.1-8B-Instruct"; //requires pro subscription
    //static modelName="google/gemma-2-27b-it"; //no response
    //static modelName="facebook/opt-1.3b"; //no response
    //static modelName="bigscience/bloomz-560m"; // no response
    //static modelName="google/gemma-2-2b" // too large to be loaded automatically -> use spaces
    //static modelName="distilbert/distilgpt2" //an error occurred while fetching the blob
    //static modelName="meta-llama/Llama-3.2-1B-Instruct" //useless, doesn't respect required structure and output tokens are too low
    //static modelName="openai-community/gpt2-large" //error occurred while fetching the blob
    //static modelName="mistralai/Mistral-Nemo-Instruct-2407" //requires pro
    //static modelName="HuggingFaceH4/starchat2-15b-v0.1" //output tokens are too low
    //static modelName = "microsoft/Phi-3-mini-4k-instruct" // useless, output tokens too low and doesn't respect required structure
    //static modelName="meta-llama/Meta-Llama-3.1-8B-Instruct" //requires pro subscription
    //static modelName="google/gemma-2-2b-it" //no response
    //static modelName="nvidia/Llama-3.1-Nemotron-70B-Instruct-HF" // requires pro subscribtion

    constructor(APIKey, config) {
        super(APIKey, config);
    }

    getModelName() {
        return Qwen.modelName;
    }
}

export default Qwen;

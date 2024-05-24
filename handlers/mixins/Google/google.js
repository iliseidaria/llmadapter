import * as GoogleGenerativeAI from "@google/generative-ai";

function createGoogleGenerativeAIInstance(APIKey) {
    if (!APIKey) {
        const error = new Error("API key not provided");
        error.statusCode = 400;
        throw error;
    }
    return new GoogleGenerativeAI(APIKey);
}

export default async function (modelInstance) {
    const GoogleGenerativeAI = createGoogleGenerativeAIInstance(modelInstance.APIKey);
    const model = GoogleGenerativeAI.getGenerativeModel({model: modelInstance.getModelName()});
    modelInstance.getResponse = async function (prompt, configs){
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
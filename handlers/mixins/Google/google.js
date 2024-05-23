import * as GoogleGenerativeAI from "@google/generative-ai";

function createGoogleGenerativeAIInstance(apiKey) {
    if (!apiKey) {
        const error = new Error("API key not provided");
        error.statusCode = 400;
        throw error;
    }
    return new GoogleGenerativeAI(apiKey);
}

export default async function (modelInstance) {
    const GoogleGenerativeAI = createGoogleGenerativeAIInstance(modelInstance.apiKey);
    const model = GoogleGenerativeAI.getGenerativeModel({model: modelInstance.getModelName()});
    modelInstance.getResponse = async function (prompt, configs){
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
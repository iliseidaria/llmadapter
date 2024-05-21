import {HuggingFace, RAGApplicationBuilder} from "embedJs";

const ragApplication = await new RAGApplicationBuilder()
    .setModel(new HuggingFace({ modelName: 'mistralai/Mixtral-8x7B-v0.1' }))
    .build();
const answer = await ragApplication.generateAnswer("What is the capital of France?");
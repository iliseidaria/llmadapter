import OpenAITextMixin from '../mixins/OpenAI/text.js';
import OpenAIImageMixin from '../mixins/OpenAI/image.js';
import OpenAIAudioMixin from '../mixins/OpenAI/audio.js';
import HuggingFaceText from '../mixins/HuggingFace/text.js';
import SynclabsLipsync from '../mixins/Synclabs/lipsync.js';
import PlayHTAudio from '../mixins/PlayHT/audio.js';
import MidjourneyImage from '../mixins/Midjourney/image.js';
import HuggingFaceChat from '../mixins/HuggingFace/chat.js';
import fsPromises from "fs/promises";
import { fileURLToPath } from 'url';

import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Throttler = (await import('../../utils/Throttler.js')).default;

const Mixins = {
    OpenAI_Text: OpenAITextMixin,
    OpenAI_Image: OpenAIImageMixin,
    OpenAI_Audio: OpenAIAudioMixin,
    HuggingFace_Text: HuggingFaceText,
    HuggingFace_Chat: HuggingFaceChat,
    Synclabs_Lipsync: SynclabsLipsync,
    PlayHT_Audio: PlayHTAudio,
    MidJourney_Image: MidjourneyImage,
};

const ModelTypes = {
    TextLLM: (await import('../interfaces/TextLLM.js')).default,
    ImageLLM: (await import('../interfaces/ImageLLM.js')).default,
    AudioLLM: (await import('../interfaces/AudioLLM.js')).default,
    VideoLLM: (await import('../interfaces/VideoLLM.js')).default,
    ChatLLM: (await import('../interfaces/ChatLLM.js')).default,
}
let supportedCompaniesData= JSON.parse(
    await fsPromises.readFile(
        path.join(__dirname, '../../supportedCompanies.json'),
        'utf-8'
    )
);
let llmConfigs= {};
for(const company of supportedCompaniesData){
    for(const llm of company.models){
        llmConfigs[llm.name]= llm;
    }

}

const LLMs = {
    "PlayHT2.0": {
        instance: ModelTypes.AudioLLM,
        defaultMixins: ['PlayHT_Audio'],
        config:llmConfigs["PlayHT2.0"],
        throttling: {
            limit: 10,
            interval: 60000
        }
    },
    "PlayHT2.0-Turbo": {
        instance: ModelTypes.AudioLLM,
        defaultMixins: ['PlayHT_Audio'],
        config:llmConfigs["PlayHT2.0-Turbo"],
        throttling: {
            limit: 10,
            interval: 60000
        }
    },
    "sync-1.7.1": {
        instance: ModelTypes.VideoLLM,
        defaultMixins: ['Synclabs_Lipsync'],
        config:llmConfigs["sync-1.7.1"],
    },
    "sync-1.6.0": {
        instance: ModelTypes.VideoLLM,
        defaultMixins: ['Synclabs_Lipsync'],
        config:llmConfigs["sync-1.6.0"],
    },
    "Qwen/Qwen2.5-72B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["Qwen/Qwen2.5-72B-Instruct"],
    },
    "meta-llama/Meta-Llama-3.1-8B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["meta-llama/Meta-Llama-3.1-8B-Instruct"],
    },
    "meta-llama/Meta-llama-3-8B": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["meta-llama/Meta-llama-3-8B"],
    },
    "mistralai/Mistral-8x7B-Instruct-v0.1": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["mistralai/Mistral-8x7B-Instruct-v0.1"],
    },
    "meta-llama/Llama-2-7b-chat-hf": {
        instance: ModelTypes.ChatLLM,
        defaultMixins: ['HuggingFace_Chat'],
        config:llmConfigs["meta-llama/Llama-2-7b-chat-hf"],
    },
    "meta-llama/Meta-llama-2-70B-chat-hf": {
        instance: ModelTypes.ChatLLM,
        defaultMixins: ['HuggingFace_Chat'],
        config:llmConfigs["meta-llama/Meta-llama-2-70B-chat-hf"],
    },
    "mistralai/Mistral-7B-v0.1": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["mistralai/Mistral-7B-v0.1"],
    },
    "google/gemma-7b": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["google/gemma-7b"],
    },
    "bigscience/bloom": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["bigscience/bloom"],
    },
    "meta-llama/Meta-llama-3-8B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["meta-llama/Meta-llama-3-8B-Instruct"],
    },
    "mistralai/Mistral-7B-Instruct-v0.2": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["mistralai/Mistral-7B-Instruct-v0.2"],
    },
    "meta-llama/Llama-3.1-8B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["meta-llama/Llama-3.1-8B-Instruct"],
    },
    "xai-org/grok-1": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["xai-org/grok-1"],
    },
    "databricks/dolly-v2-12b": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["databricks/dolly-v2-12b"],
    },
    "mistralai/Mistral-Nemo-Instruct-2407": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["mistralai/Mistral-Nemo-Instruct-2407"],
    },
    "EleutherAI/gpt-j-6b": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["EleutherAI/gpt-j-6b"],
    },
    "nvidia/Llama-3.1-Nemotron-70B-Instruct-HF": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["nvidia/Llama-3.1-Nemotron-70B-Instruct-HF"],
    },
    "openai-community/gpt2": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["openai-community/gpt2"],
    },
    "Qwen/QwQ-32B-Preview":{
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
        config:llmConfigs["Qwen/QwQ-32B-Preview"],
    },
    "gpt-4o": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['OpenAI_Text'],
        config:llmConfigs["gpt-4o"],

    },
    "o1-preview": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['OpenAI_Text'],
        config:llmConfigs["o1-preview"],
    },
    "o1-mini": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['OpenAI_Text'],
        config:llmConfigs["o1-mini"],
    },
    "MidJourney": {
        instance: ModelTypes.ImageLLM,
        defaultMixins: ['MidJourney_Image'],
        config:llmConfigs["MidJourney"],
    },
    "dall-e-3": {
        instance: ModelTypes.ImageLLM,
        defaultMixins: ['OpenAI_Image'],
        config:llmConfigs["dall-e-3"],
    },
    "dall-e-2": {
        instance: ModelTypes.ImageLLM,
        defaultMixins: ['OpenAI_Image'],
        config:llmConfigs["dall-e-2"],
    },
    "tts-1":{
        instance: ModelTypes.AudioLLM,
        defaultMixins: ['OpenAI_Audio'],
        config:llmConfigs["tts-1"],
        throttling: {
            limit: 500,
            interval: 60000
        }
    },
    "tts-1-hd":{
        instance: ModelTypes.AudioLLM,
        defaultMixins: ['OpenAI_Audio'],
        config:llmConfigs["tts-1-hd"],
        throttling: {
            limit: 500,
            interval: 60000
        }
    }
};


async function createLLM(LLMName, APIKey, config = {}, ...additionalMixins) {
    const LLMClass = LLMs[LLMName];
    if (!LLMClass) {
        throw _createError(`No LLM found with the name: ${LLMName}`, 404);
    }
    const defaultMixins = LLMClass.defaultMixins || [];
    const allMixins = Array.from(new Set([...defaultMixins, ...additionalMixins]));

    if (typeof config !== 'object') {
        throw _createError(`Config must be an object`, 400);
    }

    config = Object.keys(config).length ? config : (LLMClass.config || {});

    const instance = new LLMClass.instance(APIKey, config, LLMName);
    if (LLMClass.throttling) {
        instance.throttler = new Throttler(LLMClass.throttling.limit, LLMClass.throttling.interval);
    }
    for (const mixin of allMixins) {
        const mixinFunction = Mixins[mixin];
        if (!mixinFunction) {
            throw _createError(`No mixin found with the name: ${mixin}`, 404);
        }
        await mixinFunction(instance);
    }

    return instance;
}

function _createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
}


export default {
    createLLM,
};

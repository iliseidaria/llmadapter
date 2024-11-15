import OpenAITextMixin from '../mixins/OpenAI/text.js';
import OpenAIImageMixin from '../mixins/OpenAI/image.js';
import HuggingFaceText from '../mixins/HuggingFace/text.js';
import SynclabsLipsync from '../mixins/Synclabs/lipsync.js';
import PlayHTAudio from '../mixins/PlayHT/audio.js';
import MidjourneyImage from '../mixins/Midjourney/image.js';
import HuggingFaceChat from '../mixins/HuggingFace/chat.js';

const Throttler = (await import('../../utils/Throttler.js')).default;

const Mixins = {
    OpenAI_Text: OpenAITextMixin,
    OpenAI_Image: OpenAIImageMixin,
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

const LLMs = {
    "PlayHT2.0": {
        instance: ModelTypes.AudioLLM,
        defaultMixins: ['PlayHT_Audio'],
        throttling: {
            limit: 10,
            interval: 60000
        }
    },
    "sync-1.7.1": {
        instance: ModelTypes.VideoLLM,
        defaultMixins: ['Synclabs_Lipsync'],
    },
    "sync-1.6.0": {
        instance: ModelTypes.VideoLLM,
        defaultMixins: ['Synclabs_Lipsync'],
    },
    "Qwen/Qwen2.5-72B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
    },
    "meta-llama/Meta-Llama-3.1-8B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text'],
    },
    "meta-llama/Meta-llama-3-8B": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "mistralai/Mistral-8x7B-Instruct-v0.1": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "meta-llama/Llama-2-7b-chat-hf": {
        instance: ModelTypes.ChatLLM,
        defaultMixins: ['HuggingFace_Chat']
    },
    "meta-llama/Meta-llama-2-70B-chat-hf": {
        instance: ModelTypes.ChatLLM,
        defaultMixins: ['HuggingFace_Chat']
    },
    "mistralai/Mistral-7B-v0.1": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "google/gemma-7b": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "bigscience/bloom": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "meta-llama/Meta-llama-3-8B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "mistralai/Mistral-7B-Instruct-v0.2": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "meta-llama/Llama-3.1-8B-Instruct": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "xai-org/grok-1": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "databricks/dolly-v2-12b": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "mistralai/Mistral-Nemo-Instruct-2407": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "EleutherAI/gpt-j-6b": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "openai-community/gpt2": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['HuggingFace_Text']
    },
    "GPT-4o": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['OpenAI_Text'],
    },
    "o1-preview": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['OpenAI_Text'],
    },
    "o1-mini": {
        instance: ModelTypes.TextLLM,
        defaultMixins: ['OpenAI_Text'],
    },
    "MidJourney": {
        instance: ModelTypes.ImageLLM,
        defaultMixins: ['MidJourney_Image'],
    },
    "dall-e-3": {
        instance: ModelTypes.ImageLLM,
        defaultMixins: ['OpenAI_Image']
    },
    "dall-e-2": {
        instance: ModelTypes.ImageLLM,
        defaultMixins: ['OpenAI_Image']
    },
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

    config = Object.keys(config).length ? config : (LLMClass.instance.defaultConfig || {});

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

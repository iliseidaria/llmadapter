import  OpenAITextMixin from '../mixins/OpenAI/Text.js';
import  OpenAIImageMixin from '../mixins/OpenAI/Image.js';
import  QwenTextMixin from '../mixins/Qwen/Text.js';

// import * as AnthropicMixin from '../mixins/Anthropic/anthropic.js';
// import * as GoogleMixin from '../mixins/Google/google.js';
const Mixins = {
    openAI_Text: OpenAITextMixin,
    openAI_Image: OpenAIImageMixin,
    // anthropic: AnthropicMixin,
    // google: GoogleMixin,
    qwen_Text: QwenTextMixin
};

const LLMs = {
    "PlayHT2.0": (await import('../models/audio/PlayHT/index.js')),
    "sync-1.6.0": (await import('../models/video/SYNC160/index.js')),
    "Qwen": {
        instance: (await import('../models/text/Qwen/index.js')).default,
        defaultMixins: ['qwen_Text'],
    },

    "GPT-4o": {
        instance: (await import('../models/text/GPT-4o/index.js')).default,
        defaultMixins: ['openAI_Text'],
    },
    "o1-preview": {
        instance: (await import('../models/text/o1-preview/index.js')).default,
        defaultMixins: ['openAI_Text'],
    },
    "o1-mini": {
        instance: (await import('../models/text/o1-mini/index.js')).default,
        defaultMixins: ['openAI_Text'],
    },
    "DALL-E-3": {
        instance: (await import('../models/image/DALL-E-3/index.js')).default,
    },
    "DALL-E-2": {
        instance: (await import('../models/image/DALL-E-2/index.js')).default,
    },
    "MidJourney": {
        instance: (await import('../models/image/MidJourney/index.js')).default,
    },
};

class LLMFactory {
    static async createLLM(LLMName, APIKey, config = {}, ...additionalMixins) {
        const LLMClass = LLMs[LLMName];
        if (!LLMClass) {
            throw this._createError(`No LLM found with the name: ${LLMName}`, 404);
        }
        const defaultMixins = LLMClass.defaultMixins || [];
        const allMixins = Array.from(new Set([...defaultMixins, ...additionalMixins]));

        if (typeof config !== 'object') {
            throw this._createError(`Config must be an object`, 400);
        }

        config = Object.keys(config).length ? config : (LLMClass.instance.defaultConfig || {});

        const instance = new LLMClass.instance(APIKey, config);
        instance.throttler = LLMClass.throttler;
        for (const mixin of allMixins) {
            const mixinFunction = Mixins[mixin];
            if (!mixinFunction) {
                throw this._createError(`No mixin found with the name: ${mixin}`, 404);
            }
            await mixinFunction(instance);
        }

        return instance;
    }

    static _createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
    }
}

export default LLMFactory;

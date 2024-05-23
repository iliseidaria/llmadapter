import  OpenAITextMixin from '../mixins/OpenAI/Text.js';
import  OpenAIImageMixin from '../mixins/OpenAI/Image.js';
// import * as AnthropicMixin from '../mixins/Anthropic/anthropic.js';
// import * as GoogleMixin from '../mixins/Google/google.js';

const Mixins = {
    openAI_Text: OpenAITextMixin,
    openAI_Image: OpenAIImageMixin,
    // anthropic: AnthropicMixin,
    // google: GoogleMixin,
};

const LLMs = {
    "GPT-3.5-Turbo": {
        instance: (await import('../models/text/GPT-3.5-Turbo/index.js')).default
    },
    "GPT-4": {
        instance: (await import('../models/text/GPT-4/index.js')).default,
    },
    "GPT-4-Turbo": {
        instance: (await import('../models/text/GPT-4-Turbo/index.js')).default,
    },
    "GPT-4o": {
        instance: (await import('../models/text/GPT-4o/index.js')).default,
        defaultMixins: ['openAI_Text'],

    },
    "DALL-E-3": {
        instance: (await import('../models/image/DALL-E-3/index.js')).default,
        defaultMixins: ['openAI_Image'],
    },
    "DALL-E-2": {
        instance: (await import('../models/image/DALL-E-2/index.js')).default,
    },
    "Claude-3": {
        instance: (await import('../models/text/Claude-3/index.js')).default,
    },
    "Claude-2": {
        instance: (await import('../models/text/Claude-2/index.js')).default,
    },
    "Gemini": {
        instance: (await import('../models/text/Gemini/index.js')).default,
    },
};

class LLMFactory {
    static async createLLM(LLMName, apiKey, config = {}, ...additionalMixins) {
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

        const instance = new LLMClass.instance(apiKey, config);
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

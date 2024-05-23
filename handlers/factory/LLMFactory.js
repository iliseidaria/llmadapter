const OpenAITextMixin = require('../mixins/OpenAI/Text.js');
const OpenAIImageMixin = require('../mixins/OpenAI/Image.js');
/*const AnthropicMixin = require('../mixins/Anthropic/anthropic.js');
const GoogleMixin = require('../mixins/Google/google.js');*/

const Mixins = {
    openAI_Text: OpenAITextMixin,
    openAI_Image: OpenAIImageMixin,
    /* anthropic: AnthropicMixin,
    google: GoogleMixin,*/
};

const LLMs = {
    "GPT-3.5-Turbo": {
        instance: require('../models/text/GPT-3.5-Turbo/index.js'),
    },
    "GPT-4": {
        instance: require('../models/text/GPT-4/index.js'),
    },
    "GPT-4-Turbo": {
        instance: require('../models/text/GPT-4-Turbo/index.js'),
    },
    "GPT-4o": {
        instance: require('../models/text/GPT-4o/index.js'),
    },
    "DALL-E-3": {
        instance: require('../models/image/DALL-E-3/index.js'),
        defaultMixins: ['openAI_Text'],
    },
    "DALL-E-2": {
        instance: require('../models/image/DALL-E-2/index.js'),
    },
    "Claude-3": {
        instance: require('../models/text/Claude-3/index.js'),
    },
    "Claude-2": {
        instance: require('../models/text/Claude-2/index.js'),
    },
    "Gemini": {
        instance: require('../models/text/Gemini/index.js'),
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

        const instance = new LLMClass.instance(apiKey,config);

        allMixins.forEach(mixinName => {
            const mixin = Mixins[mixinName];
            if (!mixin) {
                this._createError(`No mixin found with the name: ${mixinName}`, 404);
            }
            mixin(instance);
        });

        return instance;
    }

    static _createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
    }
}

module.exports = LLMFactory;

import { EventEmitter } from 'events';

class LLMStreamingEmitter extends EventEmitter {
}

const LLMStreamEmitter = new LLMStreamingEmitter();

export { LLMStreamEmitter, LLMStreamingEmitter };

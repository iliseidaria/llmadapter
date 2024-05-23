import { EventEmitter } from 'events';

class LLMStreamingEmitter extends EventEmitter {}

const createStreamEmitter = () => {
    return new LLMStreamingEmitter();
};

export { createStreamEmitter };

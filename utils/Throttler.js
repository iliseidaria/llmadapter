class Throttler {
    constructor(limit, interval) {
        this.limit = limit; // Max number of tasks allowed per interval
        this.interval = interval; // Time window in milliseconds
        this.queue = [];
        this.taskTimestamps = []; // Track when tasks were executed
    }

    async addTask(executeFN) {
        return new Promise((resolve, reject) => {
            this.queue.push({ executeFN, resolve, reject });
            this.runNext();
        });
    }

    async runNext() {
        const now = Date.now();

        // Clean up old timestamps that are outside the interval window
        this.taskTimestamps = this.taskTimestamps.filter(timestamp => now - timestamp < this.interval);

        // Check if we can run a task (within the limit)
        if (this.taskTimestamps.length < this.limit && this.queue.length > 0) {
            const { executeFN, resolve, reject } = this.queue.shift();
            this.taskTimestamps.push(now); // Track when this task was executed

            try {
                const result = await executeFN();
                resolve(result);
            } catch (error) {
                reject(error);
            } finally {
                this.runNext();
            }
        } else if (this.queue.length > 0) {
            // If limit exceeded, wait for the next available slot
            const waitTime = this.interval - (now - this.taskTimestamps[0]);
            setTimeout(() => this.runNext(), waitTime);
        }
    }
}

export default Throttler;

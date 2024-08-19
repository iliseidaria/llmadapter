class Throttler {
    constructor(limit, interval) {
        this.limit = limit;
        this.interval = interval;
        this.queue = [];
        this.activeTasks = 0;
    }

    async addTask(executeFN) {
        return new Promise((resolve, reject) => {
            this.queue.push({ executeFN, resolve, reject });
            this.runNext();
        });
    }

    async runNext() {
        if (this.activeTasks < this.limit && this.queue.length > 0) {
            const { executeFN, resolve, reject } = this.queue.shift();
            this.activeTasks++;
            try {
                const result = await executeFN();
                resolve(result);
            } catch (error) {
                reject(error);
            } finally {
                this.activeTasks--;
                // Run the next task after a delay, based on the rate limit
                setTimeout(() => this.runNext(), this.interval / this.limit);
            }
        }
    }
}

export default Throttler;
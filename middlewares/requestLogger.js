const requestLogger = async (req, res, next) => {
    // Capture start time
    const startTime = process.hrtime();

    // Store original end function
    const originalEnd = res.end;

    // Override end function to log response details
    res.end = function(...args) {
        // Calculate duration
        const hrTime = process.hrtime(startTime);
        const duration = (hrTime[0] * 1000 + hrTime[1] / 1000000).toFixed(2);

        // Log request details with response info
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);

        // Call original end function
        originalEnd.apply(res, args);
    };

    // Continue to next middleware
    await next();
};

export default requestLogger;
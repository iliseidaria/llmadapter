function bodyReader(req, res, next) {
    const data = [];

    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => {
        const contentType = req.headers['content-type'] || '';
        const buffer = Buffer.concat(data);

        if (contentType.includes('application/json')) {
            try {
                if (req.method !== 'GET') {
                    req.body = JSON.parse(buffer.toString());
                }
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({success: false, message: 'Invalid JSON'}));
                return;
            }
        } else if (
            contentType.startsWith('image/') ||
            contentType.startsWith('audio/') ||
            contentType.startsWith('video/') ||
            contentType === 'application/octet-stream'
        ) {
            req.body = buffer;
        } else {
            req.body = buffer.toString();
        }

        next();
    });

    req.on('error', (err) => {
        console.error('Error reading body:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({success: false, message: 'Internal Server Error'}));
    });
}

export default bodyReader;

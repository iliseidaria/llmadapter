function bodyReader(req, res, next) {
    const data = [];
    const contentType = req.headers['content-type'] || '';

    if (contentType.startsWith('image/') ||
        contentType.startsWith('video/') ||
        contentType.startsWith('audio/') ||
        contentType.startsWith('application/octet-stream') ||
        contentType.startsWith('application/pdf') ||
        contentType.startsWith('application/zip') ||
        contentType.startsWith('application/gzip') ||
        contentType.startsWith('application/vnd.') ||
        contentType.startsWith('multipart/form-data'))
    {
        req.body = req;
        next();
    } else {
        req.on('data', (chunk) => {
            data.push(chunk);
        });
        req.on('end', () => {

            const buffer = Buffer.concat(data);

            if (contentType.includes('application/json')) {
                try {
                    if (req.method !== 'GET') {
                        req.body = JSON.parse(buffer.toString());
                    }
                } catch (error) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({message: 'Invalid JSON'}));
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
            res.end(JSON.stringify({ message: 'Internal Server Error: ' + err}));
        });
    }
}

export default bodyReader;

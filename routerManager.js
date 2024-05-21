const textRouter= require('./routers/textRouter');
const imageRouter = require('./routers/imageRouter');

function delegate(req, res) {
    const path = new URL(req.url, `http://${req.headers.host}`).pathname;

    if (path.startsWith('/apis/v1/spaces/:spaceId/llms/text)')){
        textRouter.handle(req, res);
    } else if (path.startsWith('/apis/v1/spaces/:spaceId/llms/image')) {
        imageRouter.handle(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Endpoint not Found\n');
    }
}

module.exports.delegate = delegate;

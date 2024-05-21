
function handle(req, res) {
    const method = req.method;
    const path = new URL(req.url, `http://${req.headers.host}`).pathname;

    if (path === '/products' && method === 'GET') {
        productController.listProducts(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found\n');
    }
}

module.exports.handle = handle;

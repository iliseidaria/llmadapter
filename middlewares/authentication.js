import fetch from 'node-fetch';

async function authentication(req, res, next) {
    try {
        const { modelName } = req.body;
        const spaceId = req.params.spaceId;

        const primaryServerURL = `http://localhost:8080/apis/v1/${spaceId}/secrets/`;

        const body = {
            modelName: modelName
        };
        const response = await fetch(primaryServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cookie': req.headers.cookie
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            next(`Authentication failed with status ${response.status} and message: ${error.message}`);
        } else {
            const data = await response.json();
            req.apiKey = data.apiKey;
            req.spaceId = spaceId;
            next();
        }
    } catch (error) {
        res.status(500).send(`Error injecting API key: ${error.message}`);
    }
}

export default authentication;

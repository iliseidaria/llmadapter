const fetch = require('node-fetch');

async function getAPIKey(spaceId, modelName) {
    const apihubURL = `http://localhost:8080/apis/v1/${spaceId}/secrets/`;
    const body = {
        modelName: modelName
    };
        /* sends the cookies and a request for api key , the server authenticates authorizez and returns an api key */
    try {
        const response = await fetch(apihubURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch API key: ${response.statusText}`);
        }

        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error('Error fetching API key:', error);
        throw error;
    }
}

async function injectAPIKey(req, res, next) {
    try {
        const { modelName } = req.body;
        const spaceId = req.params.spaceId;

        const apiKey = await getAPIKey(spaceId, modelName);
        req.apiKey = apiKey;

        next();
    } catch (error) {
        res.status(500).send(`Error injecting API key: ${error.message}`);
    }
}

module.exports=injectAPIKey
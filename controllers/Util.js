import * as Request from '../utils/request.js';
import crypto from 'crypto';
import {promises as fsPromises} from 'fs';

async function getAuthRequirements(req, res) {
    try {
        const llmConfigs = await fsPromises.readFile('supportedCompanies.json', 'utf-8');
        Request.sendResponse(res, 200, 'application/json', {
            data: llmConfigs
        });
    } catch (e) {
        Request.sendResponse(res, 500, 'application/json', {
            message: e.message
        });
    }
}

function generateRefWithSignature(secret) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const data = timestamp + nonce + secret;
    let signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return {timestamp, nonce, signature};
}

function generateId(length) {
    return crypto.randomBytes(length).toString('hex');
}

async function listLlms(request, response) {
    try {
        const llmConfigs = JSON.parse(await fsPromises.readFile('supportedCompanies.json', 'utf-8'));
        let models = {};
        for (const company of llmConfigs) {
            for (const companyModel of company.models) {
                if (!models[companyModel.type]) {
                    models[companyModel.type] = [];
                }
                models[companyModel.type].push(companyModel.name);
            }
        }
        return Request.sendResponse(response, 200, 'application/json', {
            data: models
        });
    } catch (e) {
        return Request.sendResponse(response, 500, 'application/json', {
            message: e.message
        });
    }
}

const webhookURL = "http://demo.assistos.net:8080/webhook/data";
export {
    getAuthRequirements,
    generateRefWithSignature,
    webhookURL,
    generateId,
    listLlms
}

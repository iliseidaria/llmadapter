import * as Request from '../utils/request.js';
import crypto from 'crypto';
import { promises as fsPromises } from 'fs';
async function getAuthRequirements(req, res) {
    try{
        const llmConfigs = await fsPromises.readFile('supportedCompanies.json', 'utf-8');
        Request.sendResponse(res, 200, 'application/json', {
            success: true,
            data: llmConfigs
        });
    } catch (e) {
        Request.sendResponse(res, 500, 'application/json', {
            success: false,
            message: e.message
        });
    }

}
function generateRefWithSignature(secret) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const data = timestamp + nonce + secret;
    let signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return { timestamp, nonce, signature };
}
function generateId(length) {
    return crypto.randomBytes(length).toString('hex');
}
const webhookURL="http://demo.assistos.net:9000/webhook/data";
export{
    getAuthRequirements,
    generateRefWithSignature,
    webhookURL,
    generateId
}
import * as Request from '../utils/request.js';
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
export{
    getAuthRequirements
}
import * as url from 'url';
import * as Storage from '../handlers/S3.js';
import * as Request from '../utils/request.js'
async function insertRecord(req, res) {
}

async function updateRecord(req, res) {
}

async function deleteRecord(req, res) {
}

async function getRecord(req, res) {
}

async function getAllRecords(req, res) {
}

async function getImage(req, res) {
}

async function getAudio(req, res) {
}

async function getVideo(req, res) {
}

async function getImageStream(req, res) {
}

async function getAudioStream(req, res) {
}

async function getVideoStream(req, res) {
}

async function storeImage(req, res) {
    const parsedUrl = url.parse(req.url, true); // 'true' parses the query string into an object
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    const fileName = decodeURIComponent(query.fileName)+'.png';
    const data = req.body;
    const response = await Storage.putObject(Storage.devBucket, fileName, data);
}

async function storeAudio(req, res) {
}

async function storeVideo(req, res) {
}

async function deleteImage(req, res) {
}

async function deleteAudio(req, res) {
}

async function deleteVideo(req, res) {
}

export {
    insertRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    getAllRecords,
    getImage,
    getAudio,
    getVideo,
    getImageStream,
    getAudioStream,
    getVideoStream,
    storeImage,
    storeAudio,
    storeVideo,
    deleteImage,
    deleteAudio,
    deleteVideo
}

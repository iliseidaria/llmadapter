import * as Request from '../utils/request.js';
import * as Storage from '../handlers/S3.js';

async function insertRecord(spaceId, tableId, objectId, objectData) {
}
async function updateRecord(spaceId, tableId, objectId, objectData) {
}
async function deleteRecord(spaceId, tableId, objectId) {
}
async function getRecord(spaceId, tableId, objectId) {
}
async function getAllRecords(spaceId, objectId) {
}
async function getImage(spaceId, imageId) {
}
async function getAudio(spaceId, audioId) {
}
async function getVideo(spaceId, videoId) {
}
async function getImageStream(spaceId, imageId) {
}
async function getAudioStream(spaceId, audioId) {
}
async function getVideoStream(spaceId, videoId) {
}
async function storeImage(spaceId, imageId, imageData) {
}
async function storeAudio(spaceId, audioId, audioData) {
}
async function storeVideo(spaceId, videoId, videoData) {
}
async function deleteImage(spaceId, imageId) {
}
async function deleteAudio(spaceId, audioId) {
}
async function deleteVideo(spaceId, videoId) {
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

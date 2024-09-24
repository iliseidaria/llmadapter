import * as Storage from '../handlers/S3.js';
import * as Request from '../utils/request.js'
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from "url";

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
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".png";
        const data = await Storage.getObject(Storage.devBucket, fileName);
        return Request.sendResponse(res, 200, "application/octet-stream", data);
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve image",
            success: false
        });
    }
}

async function getAudio(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".mp3";
        const data = await Storage.getObject(Storage.devBucket, fileName);
        return Request.sendResponse(res, 200, "application/octet-stream", data);
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve Audio",
            success: false
        })
    }
}

async function getVideo(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".mp4";
        const data = await Storage.getObject(Storage.devBucket, fileName);
        return Request.sendResponse(res, 200, "application/octet-stream", data)
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve Video",
            success: false
        })
    }
}

async function getImageStream(req, res) {
}

async function getAudioStream(req, res) {
}

async function getVideoStream(req, res) {
}

async function storeImage(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".png";
        const data = req.body;

        await Storage.putObject(Storage.devBucket, fileName, data, req.headers["content-type"]);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Image stored successfully",
            success: true
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to store image",
            success: false
        })
    }
}

async function storeAudio(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".mp3";
        const data = req.body;
        await Storage.putObject(Storage.devBucket, fileName, data, req.headers["content-type"]);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Audio stored successfully",
            success: true
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to store Audio",
            success: false
        })
    }
}

async function storeVideo(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".mp4";
        const data = req.body;
        await Storage.putObject(Storage.devBucket, fileName, data, req.headers["content-type"]);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Video stored successfully",
            success: true
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to store Video",
            success: false
        })
    }
}

async function deleteImage(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        await Storage.deleteObject(Storage.devBucket, fileName);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Image stored successfully",
            success: true
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to delete Image",
            success: false
        })
    }
}

async function deleteAudio(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        await Storage.deleteObject(Storage.devBucket, fileName);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Audio stored successfully",
            success: true
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to delete Audio",
            success: false
        })
    }
}

async function deleteVideo(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        await Storage.deleteObject(Storage.devBucket, fileName);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Video stored successfully",
            success: true
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to delete Video",
            success: false
        })
    }
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

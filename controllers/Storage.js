import * as Storage from '../handlers/S3.js';
import * as Request from '../utils/request.js'

const fileTypes = Object.freeze({
    audios: {
        contentType: "audio/mp3",
        extension: "mp3"
    },
    images: {
        contentType: "image/png",
        extension: "png"
    },
    videos: {
        contentType: "video/mp4",
        extension: "mp4"
    }
});

async function getDownloadURL(req, res) {
    try {
        const {spaceId, downloadType, fileId} = Request.extractQueryParams(req);
        if (!spaceId || !downloadType || !fileId) {
            return Request.sendResponse(res, 400, "application/json", {
                message: "Missing required parameters" + `:${spaceId ? "" : " spaceId"}${downloadType ? "" : " downloadType"}${fileId ? "" : " fileId"}`,
                success: false
            });
        }
        const objectPath = `${spaceId}/${downloadType}/${fileId}` + `.${fileTypes[downloadType].extension}`;
        const downloadURL = await Storage.getDownloadURL(Storage.devBucket, objectPath);
        Request.sendResponse(res, 200, "application/json", {
            message: "Download URL generated successfully",
            success: true,
            data: downloadURL
        });
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to get download URL" + error.message,
            success: false
        });
    }
}

async function getUploadURL(req, res) {
    try {
        const {spaceId, uploadType, fileId} = Request.extractQueryParams(req);
        if (!spaceId || !uploadType || !fileId) {
            return Request.sendResponse(res, 400, "application/json", {
                message: "Missing required parameters" + `:${spaceId ? "" : " spaceId"}${uploadType ? "" : " uploadType"}${fileId ? "" : " fileId"}`,
                success: false
            });
        }
        if (!Object.keys(fileTypes).includes(uploadType)) {
            return Request.sendResponse(res, 400, "application/json", {
                message: "Invalid upload type",
                success: false
            });
        }
        const objectPath = `${spaceId}/${uploadType}/${fileId}` + `.${fileTypes[uploadType].extension}`;
        const uploadURL = await Storage.getUploadURL(Storage.devBucket, objectPath, fileTypes[uploadType].contentType);
        Request.sendResponse(res, 200, "application/json", {
            message: "Upload URL generated successfully",
            success: true,
            data: uploadURL
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to get upload URL" + error.message,
            success: false
        });
    }
}

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
        let range = req.headers.range;

        const s3Response = await Storage.s3.getObject({
            Bucket: Storage.devBucket,
            Key: fileName,
            Range: range
        }).promise();
        const head = {
            'Content-Range': s3Response.ContentRange,
            'Accept-Ranges': 'bytes',
            'Content-Length': s3Response.ContentLength,
            'Content-Type': s3Response.ContentType || 'video/mp4',
        };
        res.writeHead(206, head);
        s3Response.Body.pipe(res);
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve Video",
            success: false
        })
    }
}

async function getImageStream(req, res) {
    let {fileName} = Request.extractQueryParams(req);
    fileName += ".png";
    try {
        const stream = await Storage.getObjectStream(Storage.devBucket, fileName);
        stream.pipe(res);
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve image stream" + error.message,
            success: false
        });
    }
}

async function getAudioStream(req, res) {
    let {fileName} = Request.extractQueryParams(req);
    fileName += ".mp3";
    try {
        const stream = await Storage.getObjectStream(Storage.devBucket, fileName);
        stream.pipe(res);
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve Audio stream" + error.message,
            success: false
        });
    }
}

async function getVideoStream(req, res) {
    let {fileName} = Request.extractQueryParams(req);
    fileName += ".mp4";
    try {
        const stream = await Storage.getObjectStream(Storage.devBucket, fileName);
        const head = {
            'Content-Range': s3Response.ContentRange,
            'Accept-Ranges': 'bytes',
            'Content-Length': s3Response.ContentLength,
            'Content-Type': s3Response.ContentType || 'video/mp4',
        };
        stream.pipe(res);
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to retrieve Video stream" + error.message,
            success: false
        });
    }
}

async function storeImage(req, res) {
    try {
        let {fileName} = Request.extractQueryParams(req);
        fileName += ".png";
        const data = req.body;
        await Storage.uploadObject(Storage.devBucket, fileName, data, req.headers["content-type"]);
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
        await Storage.uploadObject(Storage.devBucket, fileName, data, req.headers["content-type"]);
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
        await Storage.uploadObject(Storage.devBucket, fileName, data, req.headers["content-type"]);
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

async function headImage(req, res) {
}

async function headAudio(req, res) {
}

async function headVideo(req, res) {
}

export {
    getUploadURL,
    getDownloadURL,
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
    deleteVideo,
    headImage,
    headAudio,
    headVideo
}

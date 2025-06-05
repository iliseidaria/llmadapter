import * as s3 from '../handlers/S3.js';
import * as Request from '../utils/request.js'
const devBucket = process.env.DEV_BUCKET;
const fileExtensions = Object.freeze({
    "audio/mp3": ".mp3",
    "video/mp4": ".mp4",
    "image/png": ".png",
});

async function getDownloadURL(req, res) {
    try {
        let {fileId, type} = Request.extractQueryParams(req);
        if (!fileId) {
            return Request.sendResponse(res, 400, "application/json", {
                message: "Missing required parameters" + `:${fileId ? "" : " fileId"}`,
            });
        }
        type = decodeURIComponent(type);
        if(type && type !== "undefined"){
            let extension = fileExtensions[type];
            fileId += extension;
        }

        const downloadURL = await s3.getDownloadURL(devBucket, fileId);
        Request.sendResponse(res, 200, "application/json", {
            message: "Download URL generated successfully",
            data: downloadURL
        });
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to get download URL:" + error.message,
        });
    }
}

async function getUploadURL(req, res) {
    try {
        let {type, fileId} = Request.extractQueryParams(req);
        type = decodeURIComponent(type);
        if(fileExtensions[type]){
            fileId += fileExtensions[type];
        }
        if (!type || !fileId) {
            return Request.sendResponse(res, 400, "application/json", {
                message: "Missing required parameters" + `:${type ? "" : "type"}${fileId ? "" : " fileId"}`,
            });
        }
        const uploadURL = await s3.getUploadURL(devBucket, fileId, type);
        Request.sendResponse(res, 200, "application/json", {
            message: "Upload URL generated successfully",
            data: uploadURL
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to get upload URL" + error.message,
        });
    }
}

async function getFile(req, res) {
    let {fileId, type} = Request.extractQueryParams(req);
    type = decodeURIComponent(type);
    if(type && type !== "undefined"){
        let extension = fileExtensions[type];
        fileId += extension;
    }

    const rangeHeader = req.headers.range;
    const headers = rangeHeader ? {Range: rangeHeader} : {};

    const startRangeRequest= rangeHeader ? rangeHeader.split('=')[1].split('-')[0]:0;

    const S3Response = await s3.getObject(devBucket, fileId, headers);

    const fileSize = S3Response.ContentLength + parseInt(startRangeRequest);

    if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;

        const head = {
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': end - start + 1,
            'Content-Type': S3Response.ContentType,
            'cache-control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0,
        };
        /*  if (end !== fileSize - 1) {
              head['Transfer-Encoding'] = 'chunked';
          }*/
        res.writeHead(206, head);
        S3Response.Body.pipe(res);
    } else {
        const head = {
            'Accept-Ranges': 'bytes',
            'Content-Length': fileSize,
            'Content-Type': S3Response.ContentType,
        };

        res.writeHead(200, head);
        S3Response.Body.pipe(res);
    }
}

async function putFile(req, res) {
    try {
        let {fileId, type} = Request.extractQueryParams(req);
        type = decodeURIComponent(type);
        if(fileExtensions[type]){
            fileId += fileExtensions[type];
        }
        const data = req.body;
        await s3.uploadObject(devBucket, fileId, data, type);
        return Request.sendResponse(res, 200, "application/json", {
            message: "File stored successfully",
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to store file",
        })
    }
}

async function deleteFile(req, res) {
    try {
        let {fileId, type} = Request.extractQueryParams(req);
        type = decodeURIComponent(type);
        if(type && type !== "undefined"){
            let extension = fileExtensions[type];
            fileId += extension;
        }
        await s3.deleteObject(devBucket, fileId);
        return Request.sendResponse(res, 200, "application/json", {
            message: "Image stored successfully",
        })
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to delete Image",
        })
    }
}

async function headFile(req, res) {
    try {
        let {fileId, type} = Request.extractQueryParams(req);
        type = decodeURIComponent(type);
        if(type && type !== "undefined"){
            let extension = fileExtensions[type];
            fileId += extension;
        }
        const head = await s3.headObject(devBucket, fileId);
        res.setHeader("Content-Type", type);
        res.setHeader("Content-Length",head.ContentLength);
        res.setHeader("Last-Modified", head.LastModified);
        res.setHeader("Accept-Ranges", "bytes");
        res.end();
    } catch (error) {
        return Request.sendResponse(res, error.statusCode || 500, "application/json", {
            message: "Failed to get image metadata"
        })
    }
}

export {
    getUploadURL,
    getDownloadURL,
    getFile,
    putFile,
    deleteFile,
    headFile,
    devBucket
}

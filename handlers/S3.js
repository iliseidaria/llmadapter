import AWS from 'aws-sdk';
import env from 'dotenv';
import fsPromises from "fs/promises";
import * as Request from "../utils/request.js";

const config = await fsPromises.readFile('./config.json', 'utf-8').then(JSON.parse);

env.config()

const s3 = new AWS.S3({
    endpoint: config.S3_URL,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3ForcePathStyle: true,
    region:'fra1',
    signatureVersion: 'v2'
});

async function createBucket(bucketName) {
    const params = {
        Bucket: bucketName,
    };

    return new Promise((resolve, reject) => {
        s3.createBucket(params, async (error, data) => {
            if (error) {
                return reject(error);
            } else {
                try {
                    const publicPolicy = getPublicBucketPolicy(bucketName);
                    await putBucketPolicy(bucketName, publicPolicy);
                    resolve(data);
                } catch (policyError) {
                    reject(policyError);
                }
            }
        });
    });
}

function getPublicBucketPolicy(bucketName) {
    return {
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "PublicReadGetObject",
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: `arn:aws:s3:::${bucketName}/*`
            }
        ]
    };
}

async function putBucketPolicy(bucketName, policy) {
    const params = {
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
    };

    return new Promise((resolve, reject) => {
        s3.putBucketPolicy(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function listBuckets() {
    return new Promise((resolve, reject) => {
        s3.listBuckets((error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data.Buckets);
            }
        });
    });
}

async function ensureBucketExists(bucketName) {
    const buckets = await listBuckets();
    if (buckets.find((bucket) => bucket.Name === bucketName)) {
        return;
    }
    await createBucket(bucketName);
}

async function headObject(bucketName, key) {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    return new Promise((resolve, reject) => {
        s3.headObject(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function putObject(bucketName, key, fileContent, contentType) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
    };

    return new Promise((resolve, reject) => {
        s3.putObject(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function uploadObject(bucketName, key, fileContent, contentType) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function getDownloadURL(bucketName, key, expiresInSeconds = 500) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires:  Math.floor(Date.now() / 1000) + expiresInSeconds
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (error, url) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(url);
            }
        });
    });
}

async function getUploadURL(bucketName, key, contentType, expiresInSeconds = 500) {
    const params = {
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        Expires: Math.floor(Date.now() / 1000) + expiresInSeconds
    };
    //await renameFiles(bucketName);
    return new Promise((resolve, reject) => {
        s3.getSignedUrl('putObject', params, (error, url) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(url);
            }
        });
    });
}

async function getObject(bucketName, key, headers = {}) {
    const params = {
        Bucket: bucketName,
        Key: key,
        ...headers
    };

    const metadata = await s3.headObject(params).promise();
    const stream = s3.getObject(params).createReadStream();

    return {
        Body: stream,
        ContentLength: metadata.ContentLength,
        ContentType: metadata.ContentType,
        ContentRange: headers.Range || null,
    };
}
async function deleteObject(bucketName, key) {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function listObjects(bucketName) {
    const params = {
        Bucket: bucketName,
    };

    return new Promise((resolve, reject) => {
        s3.listObjectsV2(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data.Contents);
            }
        });
    });
}

async function getBucketPolicy(bucketName) {
    const params = {
        Bucket: bucketName,
    };

    return new Promise((resolve, reject) => {
        s3.getBucketPolicy(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(JSON.parse(data.Policy));
            }
        });
    });
}

async function deleteBucketPolicy(bucketName) {
    const params = {
        Bucket: bucketName,
    };

    return new Promise((resolve, reject) => {
        s3.deleteBucketPolicy(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function putObjectAcl(bucketName, key, acl) {
    const params = {
        Bucket: bucketName,
        Key: key,
        ACL: acl,
    };

    return new Promise((resolve, reject) => {
        s3.putObjectAcl(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    });
}

async function emptyBucket(bucketName) {
    const listParams = {
        Bucket: bucketName,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: bucketName,
        Delete: {Objects: []}
    };

    listedObjects.Contents.forEach(({Key}) => {
        deleteParams.Delete.Objects.push({Key});
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyBucket(bucketName); // Repeat for truncated results
}

async function deleteBucket(bucketName) {
    try {
        await emptyBucket(bucketName);

        const params = {
            Bucket: bucketName,
        };

        return new Promise((resolve, reject) => {
            s3.deleteBucket(params, (error, data) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(data);
                }
            });
        });
    } catch (error) {
        throw new Error(`Failed to delete bucket: ${error.message}`);
    }
}


async function renameFiles(bucketName) {
    try {
        let continuationToken; // For pagination
        do {
            const params = { Bucket: bucketName, ContinuationToken: continuationToken };
            const objects = await s3.listObjectsV2(params).promise();

            // Process files in batches
            const batchPromises = objects.Contents.map(async (object) => {
                const originalKey = object.Key;
                const extension = originalKey.split('.').pop(); // Get file extension
                let fileId;

                // Extract fileId based on key format
                if (originalKey.includes('/')) {
                    fileId = originalKey.split('/').pop().split('.')[0]; // Get last segment before extension
                } else {
                    fileId = originalKey.split('.')[0]; // Directly get fileID
                }

                const newKey = `${fileId}.${extension}`;

                // Copy the object to the new key
                // await s3.copyObject({
                //     Bucket: bucketName,
                //     CopySource: `${bucketName}/${originalKey}`,
                //     Key: newKey
                // }).promise();
                //
                // // Delete the original object
                // await s3.deleteObject({ Bucket: bucketName, Key: originalKey }).promise();
                // console.log(`Renamed ${originalKey} to ${newKey}`);
            });
            await Promise.all(batchPromises);
            continuationToken = objects.IsTruncated ? objects.NextContinuationToken : null;
        } while (continuationToken);

    } catch (error) {
        console.error('Error renaming files:', error);
    }
}
export {
    listBuckets,
    createBucket,
    putObject,
    getObject,
    uploadObject,
    deleteObject,
    listObjects,
    putBucketPolicy,
    getBucketPolicy,
    deleteBucketPolicy,
    putObjectAcl,
    deleteBucket,
    headObject,
    getUploadURL,
    getDownloadURL
};


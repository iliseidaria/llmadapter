import AWS from 'aws-sdk';
import env from 'dotenv';
import fsPromises from "fs/promises";
const config =  await fsPromises.readFile('./config.json', 'utf-8').then(JSON.parse);

env.config()

const s3 = new AWS.S3({
    endpoint: config.S3_URL,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3ForcePathStyle: true,
});

const devBucket=process.env.DEV_BUCKET;

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
async function putObject(bucketName, key, fileContent,contentType) {
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

async function getObject(bucketName, key) {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    return new Promise((resolve, reject) => {
        s3.getObject(params, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data.Body);
            }
        });
    });
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
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
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

export {
    listBuckets,
    createBucket,
    putObject,
    getObject,
    deleteObject,
    listObjects,
    putBucketPolicy,
    getBucketPolicy,
    deleteBucketPolicy,
    putObjectAcl,
    deleteBucket,
    headObject,
    devBucket
};


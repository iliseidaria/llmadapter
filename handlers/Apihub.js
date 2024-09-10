import fsPromises from "fs/promises";
const config =  await fsPromises.readFile('./config.json', 'utf-8').then(JSON.parse);

async function getVideo(spaceId, videoId) {
    const response = await fetch(`${config.APIHUB_URL}/spaces/video/${spaceId}/${videoId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);
    return videoBuffer;
}

async function getAudio(spaceId, audioId) {
    const response = await fetch(`${config.APIHUB_URL}/spaces/audio/${spaceId}/${audioId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    return audioBuffer;
}

export { getAudio, getVideo };

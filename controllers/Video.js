import * as Request from '../utils/request.js';


async function generateVideo(){

}

async function lipsync(request, response) {
    const getStatus = async (lipSyncId) => {
        const apiKey = 'b2a758d8-f911-48d3-8916-eefb2d8c82a5';
    
        try {
            const statusResponse = await fetch(`https://api.synclabs.so/lipsync/${lipSyncId}`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey
                }
            });
    
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('Status:', statusData);
    
                if (statusData.status === 'COMPLETED') {
                    console.log('Video URL:', statusData.videoUrl);
                } else if (statusData.status === 'FAILED') {
                    console.error('Error:', statusData.errorMessage);
                } else if (statusData.status === 'PENDING' || statusData.status === 'PROCESSING') {
                    console.log('Processing still ongoing, checking again in 5 seconds...');
                    setTimeout(() => getStatus(lipSyncId), 5000);
                }
    
            } else {
                const errorText = await statusResponse.text();
                console.error('Status Response Error:', errorText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };
    try {
        const apiKey = 'b2a758d8-f911-48d3-8916-eefb2d8c82a5';
    
        const requestBody = {
            audioUrl: "https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortaud-27623a4f-edab-4c6a-8383-871b18961a4a.wav",
            videoUrl: "https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortvid-03a10044-7741-4cfc-816a-5bccd392d1ee.mp4",
            synergize: true,
            maxCredits: null,
            webhookUrl: null,
            model: "sync-1.6.0"
        };
    
        try {
            const response = await fetch('https://api.synclabs.so/lipsync', {
                method: 'POST',
                headers: {
                    accept: "application/json",
                    "x-api-key": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('API call successful, lipSyncId:', data.id);
                getStatus(data.id); 
            } else {
                const errorText = await response.text();
                console.error('Request Error:', errorText);
            }
        } catch (err) {
            console.error('Request error:', err);
        }
        Request.sendResponse(response, 200, "application/json", {
            success: true,
            data: statusData.videoUrl
        });
    } catch (error) {
        Request.sendResponse(response, error.statusCode || 500, "application/json", {
            success: false,
            message: error.message
        });
    }
}

export { generateVideo, lipsync}




import videoCall from "../consts/videoCall";


export async function useCheckMediaAccess() {
    var accessVideo = false, accessMic = false;

    const getMedia = (mediaType='') => {
        return new Promise((resolve) => {
            navigator.getUserMedia({[mediaType]: true}, 
                (stream) => {
                    stream.getTracks().map((track) => {
                        track.stop();
                    });
                    resolve(true);
                    console.log(mediaType, ' access granted');
                }, 
                (err) => {
                    resolve(false);
                    console.log('Error', err);
                });
        })
    }

    return new Promise((resolve, reject) => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            devices.forEach(device => {
                if (device.kind === 'videoinput' && device.deviceId) accessVideo = true;
                if (device.kind === 'audioinput' && device.deviceId) accessMic = true;
            });
            if (!accessVideo){
                getMedia('video').then((access) => accessVideo = access ).then(() => {
                    if (!accessMic) {
                        getMedia('audio').then((access) => {
                            accessMic = access;
                            resolve([accessVideo, accessMic]);
                        } ) 
                    } else {
                        resolve([accessVideo, accessMic])
                    }
                })
            } else {
                if (!accessMic) {
                    getMedia('audio').then((access) => {
                        accessMic = access;
                        resolve([accessVideo, accessMic]);
                    } ) 
                } else {
                    resolve([accessVideo, accessMic])
                }
            }
        })
    })
}

function getVideoAudioStream(video=true, audio=true) {
    let quality = videoCall.VIDEO_QUALITY;
    if (quality) quality = parseInt(quality);
    // @ts-ignore
    return navigator.mediaDevices.getUserMedia({
        video: video ? {
            frameRate: quality ? quality : 12,
            noiseSuppression: true,
            width: {min: 640, ideal: 1280, max: 1920},
            height: {min: 480, ideal: 720, max: 1080}
        } : false,
        audio: audio,
    });
}

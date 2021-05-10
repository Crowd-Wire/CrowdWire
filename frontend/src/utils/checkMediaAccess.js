import videoCall from "../consts/videoCall";
import storeDevice from "../redux/commStore.js";

export async function useCheckMediaAccess() {
    var accessVideo = false, accessMic = false;

    return new Promise((resolve, reject) => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            devices.forEach(device => {
                if (device.kind === 'videoinput' && device.deviceId) accessVideo = true;
                if (device.kind === 'audioinput' && device.deviceId) accessMic = true;
            });
            resolve([accessVideo, accessMic]);
        })
    })
}

export function getVideoAudioStream(video=true, audio=true, camId=storeDevice.getState().camId, micId=storeDevice.getState().micId) {
    let quality = videoCall.VIDEO_QUALITY;
    if (quality) quality = parseInt(quality);

    return navigator.mediaDevices.getUserMedia({
        video: video ? {
            frameRate: quality ? quality : 12,
            noiseSuppression: true,
            deviceId: camId,
            width: {min: 320, max: 1280},
            height: {min: 180, max: 720},
            facingMode: 'user'
        } : false,
        audio: audio ? {deviceId: micId} : false,
    })

}

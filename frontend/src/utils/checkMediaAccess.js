import { useState } from "react";
import videoCall from "../consts/videoCall";

export function useCheckMediaAccess() {
    const [access, setAccess] = useState(false);

    navigator.mediaDevices.enumerateDevices().then(devices => {
        let audio = false, video = false;
        devices.forEach(device => {
            if (device.kind === 'audioinput' && device.deviceId) audio = true;
            if (device.kind === 'videoinput' && device.deviceId) video = true;
        });
        if (audio && video) {
            setAccess(true);
            return;
        }
        if (!audio) getMedia('audio').then(() => {audio = true; if(audio && video) setAccess(true)});
        if (!video) getMedia('video').then(() => {video = true; if(audio && video) setAccess(true)});
    });

    const getMedia = (mediaType='') => {
        return new Promise((resolve, reject) => {
            navigator.getUserMedia({[mediaType]: true}, 
                (stream) => {
                    stream.getTracks().map((track) => {
                        track.stop();
                    });
                    resolve(true);
                    console.log(mediaType, ' access granted');
                }, 
                (err) => {
                    reject();
                    console.log('Error', err);
                });
        })
    }

    return access;
}

export function getVideoAudioStream(video=true, audio=true) {
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
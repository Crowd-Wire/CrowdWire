import React, { useCallback, useEffect, useState } from "react";
import { VolumeSlider } from "./VolumeSlider";
import Button from '../CustomButtons/Button.js';

export const VoiceSettings = () => {
  const [devices, setDevices] = useState([]);
  const [volume, setVolume] = useState(100);
  const [micId, setMicId] = useState(null);

  const fetchMics = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) =>
          setDevices(
            devices
              .filter(
                (device) => device.kind === "audioinput" && device.deviceId
              )
              .map((device) => ({ id: device.deviceId, label: device.label }))
          )
        );
    });
  }, []);


  useEffect(() => {
    fetchMics();
  }, [fetchMics]);

  return (
    <>
      <div className={`mb-2`}>
        Microphone Settings
      </div>
      {devices.length ? (
        <select
          className={`mb-4`}
          value={micId}
          onChange={(e) => setMicId(e.target.value)}
        >
          {devices.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <div className={`mb-4`}>Permission error</div>
      )}
      <div>

        <Button
          type="button"
          variant="small"
          onClick={() => {
            fetchMics();
          }}
        >
          Refresh
        </Button>
      </div>
      <div className={`mt-8 mb-2`}>
        Microphone Volume
      </div>
      <div className={`mb-8`}>
        <VolumeSlider volume={volume} onVolume={(n) => setVolume(n)} />
      </div>
    </>
  );
};
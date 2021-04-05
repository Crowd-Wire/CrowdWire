import React, { useEffect, useState } from "react";
// import { useMicIdStore } from "../../app/shared-stores";
import { VolumeSlider } from "./VolumeSlider";
import { Button, Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import { changeMicId, changeCamId } from "../../redux/store.js";
import store from "../../redux/store.js";

interface DeviceSettingsProps {}

export const DeviceSettings: React.FC<DeviceSettingsProps> = () => {

  const [micId, setMicId] = useState(store.getState().micId);
	const [camId, setCamId] = useState(store.getState().camId);

  const [optionsMic, setOptionsMic] = useState<
    Array<{ id: string; label: string } | null>
  >([]);
	const [optionsCamera, setOptionsCamera] = useState<
    Array<{ id: string; label: string } | null>
  >([]);
	const [volume, setVolume] = useState(100);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((x) =>
        setOptionsMic(
          x.map((y) =>
            y.kind !== "audioinput" ? null : { id: y.deviceId, label: y.label }
          )
        )
      );
		navigator.mediaDevices
      .enumerateDevices()
      .then((x) =>
        setOptionsCamera(
          x.map((y) =>
            y.kind !== "videoinput" ? null : { id: y.deviceId, label: y.label }
          )
        )
      );
  }, []);

  return (
    <>
			<Card>
        <CardBody>
          <h4>Device's Settings</h4>
          
          <br/>
          
          <span>Video Devices:</span>
            {optionsCamera.length === 0 ? <div>no cameras available</div> : null}
            {optionsCamera.length ? (
              <select
                value={store.getState().camId}
                onChange={(e) => {
                  const id = e.target.value;
                  store.dispatch(changeCamId(id))
                  setCamId(id);
                }}
              >
                {optionsCamera.map((x) =>
                  !x ? null : (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  )
                )}
              </select>
            ) : null}

          <br />

          <span>Audio Devices:</span>
          {optionsMic.length === 0 ? <div>no mics available</div> : null}
          {optionsMic.length ? (
            <select
              value={store.getState().micId}
              onChange={(e) => {
                const id = e.target.value;
                store.dispatch(changeMicId(id))
                setMicId(id)
              }}
            >
              {optionsMic.map((x) =>
                !x ? null : (
                  <option key={x.id} value={x.id}>
                    {x.label} - {x.id}
                  </option>
                )
              )}
            </select>
          ) : null}

          <br />

          <div className={`mt-8 mb-2`}>
            Microphone Volume
          </div>
          <div className={`mb-8`}>
            <VolumeSlider volume={volume} onVolume={(n) => setVolume(n)} />
          </div>

          <br />

        </CardBody>
      </Card>
    </>
  );
};
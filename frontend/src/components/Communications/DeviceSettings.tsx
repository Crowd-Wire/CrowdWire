import React, { useEffect, useState } from "react";
// import { useMicIdStore } from "../../app/shared-stores";
import { VolumeSlider } from "./VolumeSlider";
import { Button, Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import { changeMicId, changeCamId } from "../../redux/commStore.js";
import storeDevice from "../../redux/commStore.js";
import storeVolume, { changeGlobalVolume } from "../../redux/globalVolumeStore.js";
import { sendVoice } from "../../webrtc/utils/sendVoice";
import { sendVideo } from "../../webrtc/utils/sendVideo";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface DeviceSettingsProps {}

export const DeviceSettings: React.FC<DeviceSettingsProps> = () => {

  const [micId, setMicId] = useState(storeDevice.getState().micId);
	const [camId, setCamId] = useState(storeDevice.getState().camId);
	const [globalVolume, setGlobalVolume] = useState(storeVolume.getState().globalVolume);

  const [optionsMic, setOptionsMic] = useState<
    Array<{ id: string; label: string } | null>
  >([]);
	const [optionsCamera, setOptionsCamera] = useState<
    Array<{ id: string; label: string } | null>
  >([]);

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
          <Row>
            <span style={{marginRight: '15px'}}>Camera Devices: </span>
              {optionsCamera.length === 0 ? <div>no cameras available</div> : null}
              {optionsCamera.length ? (
                <select
                  value={storeDevice.getState().camId}
                  onChange={(e) => {
                    const id = e.target.value;
                    storeDevice.dispatch(changeCamId(id));
                    setCamId(id);
                    sendVideo();
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
          </Row>
          <br />
          <Row>
            <span style={{marginRight: '15px'}}>Microphone Devices: </span>
            {optionsMic.length === 0 ? <div>no mics available</div> : null}
            {optionsMic.length ? (
              <select
                value={storeDevice.getState().micId}
                onChange={(e) => {
                  const id = e.target.value;
                  storeDevice.dispatch(changeMicId(id));
                  setMicId(id);
                  sendVoice();
                }}
              >
                {optionsMic.map((x) =>
                  !x ? null : (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  )
                )}
              </select>
            ) : null}
          </Row>
          <br />
          <Row>
            <span style={{marginRight: '15px'}}>Global Speaker's Volume:</span>
            <VolumeSlider volume={storeVolume.getState().globalVolume} onVolume={(n) => {
              setGlobalVolume(n)
              storeVolume.dispatch(changeGlobalVolume(n))
            }} />
          </Row>

          <br />

        </CardBody>
      </Card>
    </>
  );
};
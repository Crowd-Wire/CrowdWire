import React, { useEffect, useState } from "react";
// import { useMicIdStore } from "../../app/shared-stores";
import { VolumeSlider } from "./VolumeSlider";
import { Button, Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import { changeMicId, changeCamId } from "../../redux/commStore.js";
import storeDevice from "../../redux/commStore.js";
import storeVolume, { changeGlobalVolume } from "../../redux/globalVolumeStore.js";
import Row from 'react-bootstrap/Row';

interface DeviceSettingsProps {
  closeModal: any;
}

export const DeviceSettings: React.FC<DeviceSettingsProps> = (closeModal) => {
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
    <div className="modal-device">
      <Card>
        <CardBody>
          <h4>Device's Settings</h4>
          <Row>
            <span style={{marginRight: '15px'}}>Camera Devices: </span>
              {optionsCamera.length === 0 ? <div>no cameras available</div> : null}
              {optionsCamera.length ? (
                <select
                  value={storeDevice.getState().camId}
                  onChange={(e) => {
                    const camId = e.target.value;
                    storeDevice.dispatch(changeCamId(camId));
                    setCamId(camId);
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
          <Row>
            <span style={{marginRight: '15px'}}>Microphone Devices: </span>
            {optionsMic.length === 0 ? <div>no mics available</div> : null}
            {optionsMic.length ? (
              <select
                value={storeDevice.getState().micId}
                onChange={(e) => {
                  const micId = e.target.value;
                  storeDevice.dispatch(changeMicId(micId));
                  setMicId(micId);
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
          <Row>
            <span style={{marginRight: '15px'}}>Global Speaker's Volume:</span>
            
            <VolumeSlider volume={storeVolume.getState().globalVolume} onVolume={(n) => {
              setGlobalVolume(n)
              storeVolume.dispatch(changeGlobalVolume(n))
            }} />
          </Row>
          <Button onClick={() => closeModal.closeModal()}>
            Close
          </Button>

        </CardBody>
      </Card>
    </div>
  );
};
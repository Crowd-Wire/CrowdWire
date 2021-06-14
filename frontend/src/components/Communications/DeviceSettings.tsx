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
  volColor?: string;
}

export const DeviceSettings: React.FC<DeviceSettingsProps> = ({closeModal, volColor='rgb(63, 81, 181)'}) => {
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
      <Card style={{
        height: 300,
        padding: 3,
        background: 'rgba(255, 255, 255, 0.8)',
        overflow: 'hidden',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.5)',
        borderLeft: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(3px)',
        borderRadius: '5%',
      }}>
        <CardBody>
          <div style={{textAlign: 'center'}}>
            <h3 style={{color: '#3f51b5'}}>Device's Settings</h3>
          </div>
          <Row>
            <span style={{marginRight: '15px', fontWeight:400, color: '#3f51b5'}}>Camera Devices: </span>
              {optionsCamera.length === 0 ? <span>No cameras available</span> : null}
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
            <span style={{paddingTop: '5px', marginRight: '15px', fontWeight:400, color: '#3f51b5'}}>Microphone Devices: </span>
            {optionsMic.length === 0 ? <span>No mics available</span> : null}
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
            <span style={{paddingTop: '5px', marginRight: '15px', fontWeight:400, color: '#3f51b5'}}>
              My Speaker's Volume:
            </span>
            <VolumeSlider volColor={volColor} volume={storeVolume.getState().globalVolume} onVolume={(n) => {
              setGlobalVolume(n)
              storeVolume.dispatch(changeGlobalVolume(n))
            }} />
          </Row>
          <div style={{textAlign: "center"}}>
            <Button onClick={() => closeModal()} variant="outlined" color="primary">
              Close
            </Button>
          </div>

        </CardBody>
      </Card>
    </div>
  );
};
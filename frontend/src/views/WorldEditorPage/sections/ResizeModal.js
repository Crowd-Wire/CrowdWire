import React, { useState, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

import MapManager from 'phaser/MapManager.ts';
import useWorldEditorStore from 'stores/useWorldEditorStore.ts';

const ResizeModal = (props) => {
  const subscriptions = [];
  const { open, handleClose } = props;
  const [error, setError] = useState({
    width: false,
    height: false,
    offsetX: false,
    offsetY: false,
  });
  const [value, setValue] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const theme = createMuiTheme({
    palette: {
      type: "dark"
    }
  });

  useEffect(() => {
    if (useWorldEditorStore.getState().ready)
      handleReady();
    else
      subscriptions.push(useWorldEditorStore.subscribe(
        handleReady, state => state.ready));
  },[]);

  const handleReady = () => {
    const mapManager = new MapManager;

    setValue(value => {
      value.width = mapManager.map.width;
      value.height = mapManager.map.height;
      return {...value};
    });
  }

  const handleChange = (event) => {
    const { name, val } = event.target;

    setValue(value => {
      value[name] = val;
      return {...value};
    });
  }

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle>Resize World</DialogTitle>
          <DialogContent>

            <div style={{ display: 'flex' }}>
              <div style={{ display: 'flex', flexDirection: 'column', margin: '10px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    name="width"
                    value={value.width}
                    onChange={handleChange}
                    error={error.width}
                    id="world-width"
                    label="Width"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{ marginBottom: '1rem', maxWidth: '10ch' }}
                  />tiles
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    name="height"
                    value={value.height}
                    onChange={handleChange}
                    error={error.height}
                    id="world-height"
                    label="Height"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{ maxWidth: '10ch' }}
                  />tiles
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', margin: '10px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    name="offsetX"
                    value={value.offsetX}
                    onChange={handleChange}
                    error={error.offsetX}
                    id="offset-x"
                    label="Offset X"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{ marginBottom: '1rem', maxWidth: '10ch' }}
                  />tiles
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    name="offsetY"
                    value={value.offsetY}
                    onChange={handleChange}
                    error={error.offsetY}
                    id="offset-y"
                    label="Offset Y"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{ maxWidth: '10ch' }}
                  />tiles
                </div>
              </div>
            </div>

          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}

export default ResizeModal;
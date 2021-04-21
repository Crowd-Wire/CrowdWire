import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import VolumeUp from '@material-ui/icons/VolumeUp';

interface VolumeSliderProps {
  max?: number;
  volume: number;
  onVolume: (n: number) => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  max = 100,
  volume,
  onVolume,
}) => {

  const useStyles = makeStyles({
    root: {
      width: 250,
    },
    input: {
      width: 42,
    },
  });

  const classes = useStyles();

  const handleInputChange = (event) => {
    onVolume(event.target.value === '' ? volume : Number(event.target.value));
  };

  return (

    <div className={classes.root}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <VolumeUp />
        </Grid>
        <Grid item xs>
          <input
            type="range"
            min="0"
            max={max}
            value={volume}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              onVolume(n);
            }}
          />
        </Grid>
        <Grid item>
          <Input
            className={classes.input}
            value={volume}
            margin="dense"
            onChange={handleInputChange}
            onBlur={() => {
                if (volume < 0) {
                  onVolume(0);
                } else if (volume > max) {
                  onVolume(max);
                } else {
                  onVolume(volume)
                }
              }}
            inputProps={{
              step: 10,
              min: 0,
              max: max,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};
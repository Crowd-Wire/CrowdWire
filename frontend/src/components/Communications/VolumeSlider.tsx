import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import HeadsetIcon from '@material-ui/icons/Headset';
import { Slider } from "@material-ui/core";

interface VolumeSliderProps {
  max?: number;
  volume: number;
  volColor: string;
  onVolume: (n: number) => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  max = 100,
  volume,
  volColor,
  onVolume,
}) => {

  const handleChange = (event, newval) => {
    onVolume(newval);
  }
  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item>
        <HeadsetIcon style={{color: volColor}} />
      </Grid>
      <Grid item xs>
        <Slider min={0} max={max} value={volume} 
        onChange={handleChange} style={{maxWidth: 240, color: volColor}}/>
      </Grid>
    </Grid>
  );
};
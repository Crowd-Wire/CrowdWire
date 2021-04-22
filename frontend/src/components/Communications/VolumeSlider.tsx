import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import VolumeUp from '@material-ui/icons/VolumeUp';
import { Slider } from "@material-ui/core";

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

  const handleChange = (event, newval) => {
    onVolume(newval);
  }

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item>
        <VolumeUp color={'primary'}/>
      </Grid>
      <Grid item xs>
        <Slider min={0} max={max} value={volume} 
        onChange={handleChange}/>
      </Grid>
    </Grid>
  );
};
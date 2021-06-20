import React from "react";
import classNames from "classnames";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import VisibilityTwoToneIcon from '@material-ui/icons/VisibilityTwoTone';
import VisibilityOffTwoToneIcon from '@material-ui/icons/VisibilityOffTwoTone';
import LockOpenTwoToneIcon from '@material-ui/icons/LockOpenTwoTone';
import LockTwoToneIcon from '@material-ui/icons/LockTwoTone';

import { makeStyles } from '@material-ui/core/styles';
import styles from 'assets/jss/my-kit-react/views/WorldEditorPage/tabHeaderStyle.js';

import useWorldEditorStore, { Layer } from 'stores/useWorldEditorStore';
import { useEffect } from "react";
import { useState } from "react";

interface TabSelectProps {
  placeholder: string,
  value: string,
  options: string[],
  handle: (event: React.ChangeEvent<{ value: string }>) => void,
}

export const TabSelect: React.FC<TabSelectProps> = (props) => {
  const { placeholder, value, options, handle } = props;
  const classes = makeStyles(styles)()

  return (
    <FormControl>
      <InputLabel
        htmlFor="select-tileset"
        classes={{
          focused: classes.inputState,
          shrink: classes.inputState,
          formControl: classes.inputControl,
        }}
      >{placeholder}</InputLabel>
      <Select
        native
        value={value}
        onChange={handle}
        inputProps={{
          id: 'select-tileset',
        }}
        style={{ minWidth: '15ch', margin: 0 }}
        classes={{
          select: classes.inputSelect,
        }}
      >
        <option aria-label="None" value=""></option>
        {
          options.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))
        }
      </Select>
    </FormControl>
  );
}


interface TabHeaderProps {
  Icon: any,
  names: string[],
  children?: React.ReactNode | React.ReactNode[],
}

export const TabHeader: React.FC<TabHeaderProps> = (props) => {
  const { Icon, names, children } = props;
  const classes = makeStyles(styles)();
  const [visible, setVisible] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    handleLayerChange(Object.entries(useWorldEditorStore.getState().layers));
    const unsubscribe = useWorldEditorStore.subscribe(
      handleLayerChange, state => Object.entries(state.layers));

    return (() => {
      unsubscribe();
    })
  })

  const handleLayerChange = (layers: [string, Layer][]) => {
    setVisible(
      layers.some(([name, layer]) => names.includes(name) && layer.visible));
    setLocked(
      !layers.some(([name, layer]) => names.includes(name) && !layer.blocked));
  }

  const handleVisible = () => {
    useWorldEditorStore.setState(state => {
      const layers = state.layers;
      for (const name of names)
        layers[name].visible = !visible;
      return { layers };
    });
  }

  const handleLocked = () => {
    useWorldEditorStore.setState(state => {
      const layers = state.layers;
      for (const name of names)
        layers[name].blocked = !locked;
      return { layers };
    });
  }

  return (
    <div className={classes.root}>
      <div className={classes.rootLeft}>
        <div className={classes.icon}>
          <Icon />
        </div>
        {/* {children.map((child, index) => (
          <div>
          </div>
        ))} */}
        {children}
      </div>
      <div className={classes.rootRight}>
        <div className={classNames(!visible && classes.buttonActive, classes.button)} onClick={handleVisible}>
          {visible ? <VisibilityTwoToneIcon /> : <VisibilityOffTwoToneIcon />}
        </div>
        <div className={classNames(locked && classes.buttonActive, classes.button)} onClick={handleLocked}>
          {locked ? <LockTwoToneIcon /> : <LockOpenTwoToneIcon />}
        </div>
      </div>
    </div>
  )
}

export default TabHeader;

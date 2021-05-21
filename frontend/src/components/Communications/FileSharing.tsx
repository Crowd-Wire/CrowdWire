import React, { useEffect, useState, useCallback } from "react";
import Dropzone from 'react-dropzone-uploader'
import { Button, Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import ListSubheader from '@material-ui/core/ListSubheader';
import 'react-dropzone-uploader/dist/styles.css'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow:'auto',
    maxHeight: '20vh',
    backgroundColor: theme.palette.background.paper,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid rgba(63, 81, 181, 0.5)',
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
}));

function generate(element) {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  );
}

interface FileSharingProps {
  closeModal: any;
}

export const FileSharing: React.FC<FileSharingProps> = ({closeModal}) => {
    const classes = useStyles();

    const MAX_FILE_SIZE =  20000000;

    const handleChangeStatus = ({ meta }, status) => {
      console.log(status, meta)
    }
  
    const handleSubmit = (files, allFiles) => {
      console.log(files.map(f => f.meta))
      allFiles.forEach(f => f.remove())
    }

    const checkFileSizes = (files) => {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_SIZE)
          return true;
      }
      return false;
    }

    return (
    <div className="modal-file">
      <Card style={{
        padding: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        overflow: 'hidden',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.5)',
        borderLeft: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(3px)',
        borderRadius: '1%',
      }}>
        <CardBody>
          <div style={{textAlign: 'center'}}>
            <h3 style={{color: '#3f51b5', fontWeight: 'bold'}}>File Sharing</h3>
          </div>

          <Row>
            <Col sm={12}>
            <div style={{textAlign: 'left'}}>
              <h4 style={{color: '#f50057', fontWeight: 'bold'}}>Upload File</h4>
            </div>
              <Dropzone
                onChangeStatus={handleChangeStatus}
                onSubmit={handleSubmit}
                maxFiles={3}
                inputContent="Drop Files (max. 3)"
                styles={{ dropzone: { minHeight: 150, maxHeight: '20vh', color: '#f50057' },
                submitButton: { background: 'transparent', color: '#f50057', border: '1px solid #f50057'},
                inputLabel : { color: '#f50057'},
                inputLabelWithFiles: { background: '#f50057', color: 'white', border: '1px solid white'} }}
                submitButtonDisabled={files => checkFileSizes(files)}
              />
            </Col>
          </Row>

          <Row>
            <Col sm={12}>
              <div style={{textAlign: 'left', paddingTop:20}}>
                <h4 style={{color: '#f50057', fontWeight: 'bold'}}>List of Files</h4>
              </div>
              <Grid container spacing={2} style={{paddingBottom: 40 }}>
                <Grid item xs={12} className={classes.demo}>
                  <div className={classes.demo}>
                    <List dense={false} className={classes.root}>
                      {generate(
                        <>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>
                              <FolderIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Single-line item"
                            secondary='Secondary text'
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete">
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                        </>,
                      )}
                    </List>
                  </div>
                </Grid>
              </Grid>
            </Col>
          </Row>

          <div style={{textAlign: "center"}}>
            <Button onClick={() => closeModal()} style={{width: '35%'}} variant="contained" color="primary">
              Leave File Share
            </Button>
          </div>

        </CardBody>
      </Card>
    </div>
  );
};
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
import DownloadIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import ListSubheader from '@material-ui/core/ListSubheader';
import 'react-dropzone-uploader/dist/styles.css'
import { wsend } from 'services/socket.js';
import { toast } from 'react-toastify';
import logo from 'assets/crowdwire_white_logo.png';
import { useWsHandlerStore } from "webrtc/stores/useWsHandlerStore";
import { useConsumerStore } from "webrtc/stores/useConsumerStore";
import useWorldUserStore from "stores/useWorldUserStore";
import { sendFile } from 'webrtc/utils/sendFile';

const toast_props = {
  position: toast.POSITION.TOP_RIGHT,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  draggable: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  progress: undefined,
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow:'auto',
    maxHeight: '33vh',
    height: '33vh',
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
    const [myFiles, setMyFiles] = useState([]);
    const MAX_FILE_SIZE =  20000000;
    const [listOfFiles, setListOfFiles] = useState([]);
    const myUserId = useWorldUserStore.getState().world_user.user_id;

    useEffect(() => {
      wsend({ topic: "GET_ROOM_USERS_FILES"});

      useWsHandlerStore.getState().addWsListener(`GET_ROOM_USERS_FILES`, (d) => {
        setListOfFiles(d.files)
      })
      
      useWsHandlerStore.getState().addWsListener(`ADD_USER_FILES`, (d) => {
        setListOfFiles(listOfFiles => listOfFiles.concat(d.files))
      })
  
      useWsHandlerStore.getState().addWsListener(`REMOVE_USER_FILE`, (d) => {
        setListOfFiles(listOfFiles => listOfFiles.filter( file => file.id !== d.file.id ))
      })
  
      useWsHandlerStore.getState().addWsListener(`REMOVE_ALL_USER_FILES`, (d) => {
        setListOfFiles(listOfFiles => listOfFiles.filter( file => file.owner !== d.user_id ))
      })
    }, [])

    const removeFile = (file) => {
      setMyFiles(myFiles => myFiles.filter( f => f.name !== file.name ))
      setListOfFiles(listOfFiles => listOfFiles.filter( f => f.id !== file.id ))
      wsend({ topic:'REMOVE_USER_FILE', 'file': file })
    }

    const requestDownloadFile = (file) => {
      console.log(file)
    }
  
    const handleSubmit = (files, allFiles) => {
      let add_files = []
      if ( ( myFiles.length + allFiles.length ) <= 3) {
        for (let i=0; i<allFiles.length; i++) {
          allFiles[i].meta['owner'] = myUserId;
          myFiles.push(allFiles[i].file);
          add_files.push(allFiles[i].meta);
          allFiles[i].remove();
        }
        wsend({ topic: "ADD_USER_FILES", 'files': add_files });
      } else{
        toast.error(
          <span>
            <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
            Already Uploaded the Maximum Number of Files (3)!
          </span>
          , toast_props
        );
      }
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
            <Col sm={12} md={6}>
              <div style={{textAlign: 'left'}}>
                <h4 style={{color: '#f50057', fontWeight: 'bold'}}>Upload File</h4>
              </div>
              <Dropzone
                onSubmit={handleSubmit}
                maxFiles={3}
                inputContent="Drop Files (max. 3)"
                styles={{ dropzone: {minHeight: 100, height: '35vh', maxHeight: '35vh', color: '#f50057' },
                submitButton: { background: 'transparent', color: '#f50057', border: '1px solid #f50057'},
                inputLabel : { color: '#f50057'},
                inputLabelWithFiles: { background: '#f50057', color: 'white', border: '1px solid white'} }}
                submitButtonDisabled={files => checkFileSizes(files)}
              />
            </Col>

            <Col sm={12} md={6}>
              <div style={{textAlign: 'left', paddingTop:10}}>
                <h4 style={{color: '#f50057', fontWeight: 'bold'}}>List of Files</h4>
              </div>
              <Grid container spacing={2}>
                <Grid item xs={12} className={classes.demo}>
                  <div className={classes.demo}>
                    <List dense={true} className={classes.root}>
                      { listOfFiles.map((file, index) => 
                        <div key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar alt={`${file.owner}`}>
                                <FolderIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={file.name}
                              secondary={`Size: ${file.size} ${"  Type: "} ${file.type} ${"  Owner: "} ${file.owner}`}
                            />
                            { file.owner == myUserId ?
                                <ListItemSecondaryAction>
                                  <IconButton edge="end" aria-label="delete" onClick={() => removeFile(file)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              :
                                <ListItemSecondaryAction>
                                  <IconButton edge="end" aria-label="download" onClick={() => requestDownloadFile(file)}>
                                    <DownloadIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                            }
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </div>,
                      )}
                    </List>
                  </div>
                </Grid>
              </Grid>
            </Col>
          </Row>

          <div style={{textAlign: "center", paddingTop: 15}}>
            <Button onClick={() => closeModal()} style={{width: '35%' }} variant="contained" color="primary">
              Leave File Share
            </Button>
          </div>

        </CardBody>
      </Card>
    </div>
  );
};
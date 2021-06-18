import React, { useEffect, useState } from "react";
import Dropzone from 'react-dropzone-uploader'
import { Button, Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import FolderIcon from '@material-ui/icons/Folder';
import DownloadIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import InfoIcon from '@material-ui/icons/Info';
import 'react-dropzone-uploader/dist/styles.css'
import { wsend } from 'services/socket.js';
import { toast } from 'react-toastify';
import logo from 'assets/crowdwire_white_logo.png';
import { useWsHandlerStore } from "webrtc/stores/useWsHandlerStore";
import { useConsumerStore } from "webrtc/stores/useConsumerStore";
import useWorldUserStore from "stores/useWorldUserStore";
import usePlayerStore from "stores/usePlayerStore";
import { sendFile } from 'webrtc/utils/sendFile';
import Popover from "@material-ui/core/Popover";
import styles from "assets/jss/material-kit-react/views/componentsSections/javascriptStyles.js";


//@ts-ignore
const useStylesSecond = makeStyles(styles);

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


interface FileSharingProps {
  closeModal: any;
}

export const FileSharing: React.FC<FileSharingProps> = ({closeModal}) => {
    const classes = useStyles();
    const classes2 = useStylesSecond();
    const [myFiles, setMyFiles] = useState([]);
    const MAX_FILE_SIZE =  500000000;
    const BYTES_PER_CHUNK = 20000;
    const [listOfFiles, setListOfFiles] = useState([]);
    const [sendingFile, setSendingFile] = useState(false);
    const [anchorElBottom, setAnchorElBottom] = React.useState(null);
    const [receivingFile, setReceivingFile] = useState(null);
    const [progress, setProgress] = useState([]);
    const myUserId = useWorldUserStore.getState().world_user.user_id;
    var incomingFileData = [];
    var bytesReceived = 0;

    useEffect(() => {
      wsend({ topic: "GET_ROOM_USERS_FILES"});

      useWsHandlerStore.getState().addWsListener(`GET_ROOM_USERS_FILES`, (d) => {
        setListOfFiles(d.files)
      })
      
      useWsHandlerStore.getState().addWsListener(`ADD_USER_FILES`, (d) => {
        setListOfFiles(listOfFiles => listOfFiles.concat(d.files))
      })
  
      useWsHandlerStore.getState().addWsListener(`REMOVE_USER_FILE`, (d) => {
        setListOfFiles(listOfFiles => listOfFiles.filter( file => file.id != d.file.id ))
      })
  
      useWsHandlerStore.getState().addWsListener(`REMOVE_ALL_USER_FILES`, (d) => {
        setListOfFiles(listOfFiles => listOfFiles.filter( file => file.owner != d.user_id ))
      })

      useWsHandlerStore.getState().addWsListener(`ACCEPT_DOWNLOAD_REQUEST`, (d) => {
        if (useConsumerStore.getState().consumerMap[d.file.owner] && useConsumerStore.getState().consumerMap[d.file.owner].dataConsumer) {
          wsend({ topic: 'START_DOWNLOAD', d: {'user_id': d.file.owner}} )
          useConsumerStore.getState().consumerMap[d.file.owner].dataConsumer.on('message', (message) => {
            progressDownload( message, d.file );
          })
          // send download warning to file owner so he can send file through data producer
        } else {
          toast.error(
            <span>
              <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
              Something went wrong when trying to download the file!
            </span>
            , toast_props
          );
          setReceivingFile(null);
        }
      })

      useWsHandlerStore.getState().addWsListener(`DENY_DOWNLOAD_REQUEST`, (d) => {
        setReceivingFile(null)
        toast.error(
          <span>
            <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
            {d.reason}
          </span>
          , toast_props
        );
      })
    }, [])


    function sendChunk(currentChunk, dataProducer, file) {
      var fileReader = new FileReader();
      var start = BYTES_PER_CHUNK * currentChunk;
      var end = Math.min( file.size, start + BYTES_PER_CHUNK );
      fileReader.readAsArrayBuffer( file.slice( start, end ) );

      fileReader.onload = function() {
        dataProducer.send(fileReader.result)
        currentChunk++;
        if ( BYTES_PER_CHUNK * currentChunk < file.size ) {
          setTimeout(() => { sendChunk(currentChunk, dataProducer, file) }, 100);
        } else {
          setSendingFile(false)
        }
      }
    };

    const removeFile = (file) => {
      setMyFiles(myFiles => myFiles.filter( f => f.name !== file.name ))
      setListOfFiles(listOfFiles => listOfFiles.filter( f => f.id !== file.id ))
      wsend({ topic:'REMOVE_USER_FILE', 'file': file })
    }

    const requestDownloadFile = (file) => {
      if (receivingFile) {
        toast.error(
          <span>
            <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
            Already Downloading a File!
          </span>
          , toast_props
        );
        return;
      }
      
      const owner = file.owner;

      wsend({ topic:'DOWNLOAD_REQUEST', 'file': file })
      setReceivingFile(file);
    }
  
    function progressDownload( data, file ) {
      bytesReceived += data.byteLength;
      incomingFileData.push( data );
      setProgress([(bytesReceived / file.size) * 100, ((file.size - bytesReceived)/BYTES_PER_CHUNK/10).toFixed(2)])
      if( bytesReceived === file.size ) {
        setReceivingFile(null)
        endDownload(file.name);
      }
    }

    function endDownload(file_name) {
      var blob = new window.Blob( incomingFileData );
      var anchor = document.createElement( 'a' );
      anchor.href = URL.createObjectURL( blob );
      anchor.download = file_name
      anchor.textContent = 'XXXXXXX';
  
      if( anchor.click ) {
        anchor.click();
      } else {
        var evt = document.createEvent( 'MouseEvents' );
        evt.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
        anchor.dispatchEvent( evt );
      }
      incomingFileData = [];
      bytesReceived = 0;
      setProgress([0, 0])
    }

    const handleRequestDownload = (dataProducers, file, user_requested) => {
      wsend({topic: 'ACCEPT_DOWNLOAD_REQUEST', d: {'file': file, 'user_id': user_requested}})
      useWsHandlerStore.getState().addWsListener(`START_DOWNLOAD`, (d) => {
        setSendingFile(true);
        if (dataProducers) {
          for (let i=0; i<dataProducers.length; i++) {
            let file_to_send = null;
            for (let i=0; i<myFiles.length; i++) {
              if (myFiles[i].name == file.name){
                file_to_send = myFiles[i];
                break;
              }
            }
            if (file_to_send)
              sendChunk(0, dataProducers[i], file_to_send);
          }
        }
      })
    }
  
    const handleSubmit = (files, allFiles) => {
      let add_files = []

      if ( ( myFiles.length + allFiles.length ) <= 3) {
        console.log('sending file')
        sendFile().then((dataProducers) => {
          console.log(dataProducers)
          for (let i=0; i<allFiles.length; i++) {
            allFiles[i].meta['owner'] = myUserId;
            myFiles.push(allFiles[i].file);
            add_files.push(allFiles[i].meta);
            allFiles[i].remove();
          }
          console.log({ topic: "ADD_USER_FILES", 'files': add_files })
          wsend({ topic: "ADD_USER_FILES", 'files': add_files });

          useWsHandlerStore.getState().addWsListener(`DOWNLOAD_REQUEST`, (d) => {
            if (!sendingFile) {
              let username = d.user_id;
              if (d.user_id in usePlayerStore.getState().users_info) {
                username = usePlayerStore.getState().users_info[d.user_id]?.username;
              }
              toast.info(
                <span>
                  <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
                  The User {username} Requested To Download the file {d.file.name}
                  <Button onClick={() => {handleRequestDownload(dataProducers, d.file, d.user_id); toast.dismiss("downReqId"+d.user_id);}}>Accept</Button>
                  <Button onClick={() =>
                  {wsend({topic: 'DENY_DOWNLOAD_REQUEST', d: {'user_id': d.user_id, 'reason': 'User declined the file transfer!'}}); toast.dismiss("downReqId"+d.user_id);}}>
                  Deny
                  </Button>
                </span>
                , {
                  position: toast.POSITION.TOP_RIGHT,
                  autoClose: 60000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  draggable: true,
                  progress: undefined,
                  toastId: "downReqId"+d.user_id
                }
              );
            } else {
              wsend({topic: 'DENY_DOWNLOAD_REQUEST', d: {'user_id': d.user_id, 'reason': 'User is already sharing a file!'}})
            }
          })
        })
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
            <Button onClick={event => setAnchorElBottom(event.currentTarget)} style={{color: '#f50057', fontWeight: 'bold', fontSize: 15}}>
              File Sharing Board <InfoIcon />
            </Button>
            <Popover
              classes={{
                paper: classes2.popover
              }}
              open={Boolean(anchorElBottom)}
              anchorEl={anchorElBottom}
              onClose={() => setAnchorElBottom(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
            >
              <h3 className={classes2.popoverHeader}>Limitations</h3>
              <div className={classes2.popoverBody}>
               <p>There are some limitations to be able to successfully share a file:</p>
               <p>• It is only possible to share a file with one user at a time.</p>
               <p>• Both must be on this board at the time the file is uploaded.</p>
               <p>• Maximum file size is of 500 MB.</p>
              </div>
            </Popover>
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
                      { listOfFiles.map((file, index) => {
                        let owner = file.owner;
                        if (file.owner in usePlayerStore.getState().users_info)
                          owner = usePlayerStore.getState().users_info[file.owner]?.username
                        else if (file.owner == myUserId && useWorldUserStore.getState().world_user)
                          owner = useWorldUserStore.getState().world_user.username
                        return (
                          <div key={index}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar alt={`${owner}`}>
                                  <FolderIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={file.name}
                                secondary={`Size: ${(file.size*0.000001).toFixed(2)}
                                ${"MBs  Type: "} ${file.type}
                                ${"  Owner: "} ${owner}
                                ${"  ETA: "} ${(file.size/BYTES_PER_CHUNK/10).toFixed(2)} s`}
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
                          </div>
                        )
                      })}
                    </List>
                  </div>
                </Grid>
              </Grid>
            </Col>
          </Row>

          {receivingFile ? 
            <div style={{paddingTop: 15}}>
              <h5>{receivingFile.name}</h5>
              <h6>File size: {(receivingFile.size * 0.000001).toFixed(2)} {" "} MBs</h6>
              <h6>Estimated Time Left: {progress[1]} {" "} seconds</h6>
              <ProgressBar animated now={progress[0]}/>
            </div>
            :
            ''
          }

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

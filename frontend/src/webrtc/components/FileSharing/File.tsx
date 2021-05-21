import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from "@material-ui/core/styles";
import file_pic from '../../../assets/file.png';
import { sendFile } from 'webrtc/utils/sendFile';
import { useWsHandlerStore } from "webrtc/stores/useWsHandlerStore";
import { useConsumerStore } from "webrtc/stores/useConsumerStore";


const useStyles = makeStyles((theme) => ({
  root :
  {
    display              : 'flex',
    alignItems           : 'center',
    width                : '100%',
    padding              : theme.spacing(1),
    boxShadow            : '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
    '&:not(:last-child)' :
    {
      marginBottom : theme.spacing(1)
    }
  },
  avatar :
  {
    borderRadius : '50%',
    height       : '2rem'
  },
  text :
  {
    margin  : 0,
    padding : theme.spacing(1)
  },
  fileContent :
  {
    display    : 'flex',
    alignItems : 'center'
  },
  fileInfo :
  {
    display    : 'flex',
    alignItems : 'center',
    padding    : theme.spacing(1)
  },
  button :
  {
    marginRight : 'auto'
  }
}))

interface FileProps {
  }
  

export const File: React.FC<FileProps> = ({
  }) => {
    const classes = useStyles();
    const BYTES_PER_CHUNK = 20000;
    var file;
    var fileInput;

    function sendChunk(currentChunk, dataProducer, file) {
      var fileReader = new FileReader();
      console.log('sending chunk '+ currentChunk)
      var start = BYTES_PER_CHUNK * currentChunk;
      var end = Math.min( file.size, start + BYTES_PER_CHUNK );
      fileReader.readAsArrayBuffer( file.slice( start, end ) );

      fileReader.onload = function() {
        dataProducer.send(fileReader.result)
        console.log(fileReader.result)
        currentChunk++;
        if ( BYTES_PER_CHUNK * currentChunk < file.size ) {
          setTimeout(() => { sendChunk(currentChunk, dataProducer, file) }, 100);
        } else {
          console.log("DONE SENDING FILE")
        }
      }
    };

    const sendNewFile = () => {
      sendFile().then((dataProducers) => {
        if (dataProducers) {
          fileInput = (document.getElementById('my-file') as HTMLInputElement);
          if (fileInput.value != '') {
            console.log(fileInput)
            file = fileInput.files[0];
            console.log(file.name)
            console.log(file.size)
            // send to api to list of files of current room

            useWsHandlerStore.getState().addWsListener(`REQUEST_TO_DOWNLOAD`, (d) => {
              fileInput = (document.getElementById('my-file') as HTMLInputElement);
              if (fileInput.value != '') {
                console.log(fileInput)
                file = fileInput.files[0];
                console.log(file.name)
                console.log(file.size)
                dataProducers.forEach(function (dataProducer) {
                  sendChunk(0, dataProducer, file);
                })
              }
            })

            for (let i=0; i<dataProducers.length; i++) {
              console.log(file);
              sendChunk(0, dataProducers[i], file);
            }
          }
        }
      // send to api to list of files of current room
      })
    }

    const downloadFile = (file) => {
      console.log(useConsumerStore.getState().consumerMap)
      if (useConsumerStore.getState().consumerMap[file] && useConsumerStore.getState().consumerMap[file].dataConsumer) {
        // send download warning to file owner so he can send file through data producer
        useConsumerStore.getState().consumerMap[file].dataConsumer.on('message', (message) => {
          console.log('message received from '+file);
          console.log(message)
        })
      } else {
        alert('Still creating transports please try again')
      }
    }
    
    
    return (
        <>
            <button onClick={() => sendNewFile()}>Send file</button>
            <button onClick={() => downloadFile("0")}>Prepare to Receive File from user 0</button>
            <div className={classes.root}>
              <img alt='Avatar' className={classes.avatar} src={file_pic} />
              <input  id="my-file" type="file"  />
            </div>
        </>
    );
}
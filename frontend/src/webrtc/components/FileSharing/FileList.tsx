import React from 'react';
import { File } from './File';
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
  root :
  {
    height        : '100%',
    display       : 'flex',
    flexDirection : 'column',
    alignItems    : 'center',
    overflowY     : 'auto',
    padding       : theme.spacing(1)
  }
}))

export const FileList: React.FC<{}> = ({

}) => {
  
  const classes = useStyles();

  return (
    <div  ref={(node) => { this.node = node; }}>
      { Object.entries(files).map(([ magnetUri, file ]) =>
        {
          let displayName;

          let filePicture;

          if (me.id === file.peerId)
          {
            displayName = intl.formatMessage({
              id             : 'room.me',
              defaultMessage : 'Me'
            });
            filePicture = me.picture;
          }
          else if (peers[file.peerId])
          {
            displayName = peers[file.peerId].displayName;
            filePicture = peers[file.peerId].picture;
          }
          else
          {
            displayName = intl.formatMessage({
              id             : 'label.unknown',
              defaultMessage : 'Unknown'
            });
          }

          return (
            <File
              key={magnetUri}
              magnetUri={magnetUri}
              displayName={displayName}
              picture={filePicture}
            />
          );
        })}
      </div>
    );
	}
}
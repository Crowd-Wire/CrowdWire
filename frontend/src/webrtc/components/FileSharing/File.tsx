import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import magnet from 'magnet-uri';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from "@material-ui/core/styles";


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

export const File: React.FC<{}> = ({

  }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img alt='Avatar' className={classes.avatar} src={picture} />

            <div className={classes.fileContent}>
                { file.files &&
                    <Fragment>
                        <Typography className={classes.text}>
                            <FormattedMessage
                                id='filesharing.finished'
                                defaultMessage='File finished downloading'
                            />
                        </Typography>

                        { file.files.map((sharedFile, i) => (
                            <div className={classes.fileInfo} key={i}>
                                <Typography className={classes.text}>
                                    {sharedFile.name}
                                </Typography>
                                <Button
                                    variant='contained'
                                    component='span'
                                    className={classes.button}
                                    onClick={() =>
                                    {
                                        roomClient.saveFile(sharedFile);
                                    }}
                                >
                                    <FormattedMessage
                                        id='filesharing.save'
                                        defaultMessage='Save'
                                    />
                                </Button>
                            </div>
                        ))}
                    </Fragment>
                }
                <Typography className={classes.text}>
                    <FormattedMessage
                        id='filesharing.sharedFile'
                        defaultMessage='{displayName} shared a file'
                        values={{
                            displayName
                        }}
                    />
                </Typography>

                { (!file.active && !file.files) &&
                    <div className={classes.fileInfo}>
                        <Typography className={classes.text}>
                            { magnet.decode(magnetUri).dn }
                        </Typography>
                        { canShareFiles ?
                            <Button
                                variant='contained'
                                component='span'
                                className={classes.button}
                                onClick={() =>
                                {
                                    roomClient.handleDownload(magnetUri);
                                }}
                            >
                                <FormattedMessage
                                    id='filesharing.download'
                                    defaultMessage='Download'
                                />
                            </Button>
                            :
                            <Typography className={classes.text}>
                                <FormattedMessage
                                    id='label.fileSharingUnsupported'
                                    defaultMessage='File sharing not supported'
                                />
                            </Typography>
                        }
                    </div>
                }

                { file.timeout &&
                    <Typography className={classes.text}>
                        <FormattedMessage
                            id='filesharing.missingSeeds'
                            defaultMessage={
                                `If this process takes a long time, there might not
                                be anyone seeding this torrent. Try asking someone to
                                reupload the file that you want.`
                            }
                        />
                    </Typography>
                }

                { file.active &&
                    <progress value={file.progress} />
                }
            </div>
        </div>
    );
}
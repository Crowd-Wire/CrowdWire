import React from 'react';
import Button from 'react-bootstrap/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CssBaseline from "@material-ui/core/CssBaseline";
import { createStyles, createMuiTheme,  makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import ReportService from "../../services/ReportService.js";
import { toast } from 'react-toastify';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import useWorldUserStore from 'stores/useWorldUserStore';
import usePlayerStore from 'stores/usePlayerStore';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        //@ts-ignore
        <Box span={3}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 500,
  },
}));

const useStyles2 = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);


interface ReportWorldCardProps {
  open: boolean;
  closeModal: any;
  world_name?: string;
  world_id?: any;
  inside_world?: boolean;
}

export const ReportWorldCard: React.FC<ReportWorldCardProps> = ({open, closeModal, world_name="", world_id="", inside_world=false}) => {
    const theme2 = createMuiTheme({
      palette: {
        type: "dark"
      }
    });
    const classes2 = useStyles2();
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    const [userToReport, setUserToReport] = React.useState("");
    const users = usePlayerStore(state => state.groupPlayers);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
      setValue(newValue);
    };

    const handleChangeIndex = (index: number) => {
      setValue(index);
    };

    const handleChange2 = (event: React.ChangeEvent<{ value: any }>) => {
      setUserToReport(event.target.value)
    };

    const reportWorld = () => {
      //@ts-ignore
      let comment = document.getElementById("report-world-comment").value;
      let worldToReport;
      if (world_id == "") {
        worldToReport = useWorldUserStore.getState().world_user.world_id;
      } else {
        worldToReport = world_id;
      }
      if (comment != "") {
        ReportService.sendWorldReport(worldToReport, comment)
          .then((res) => {
            if(res.ok){
              toast.success("Report Sent", {
                position: toast.POSITION.BOTTOM_RIGHT
              });
              return null;
            }
            return res.json()})
          .then((res) => {
              if(res){
                toast.error(res['detail'], {
                  position: toast.POSITION.BOTTOM_RIGHT
                });
              }
            closeModal();
          });
      } else {
        toast.error("Explain the reasoning behind the report!", {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      }
    }

    const reportUser = () => {
      //@ts-ignore
      let comment = document.getElementById("report-user-comment").value;
      if (userToReport == "") {
        toast.error("Please specify a user to report!", {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        return;
      }
      if (comment != "") {
        ReportService.sendUserReport(userToReport, useWorldUserStore.getState().world_user.world_id, comment)
          .then((res) => {
            if(res.ok){
              toast.success("Report Sent", {
                position: toast.POSITION.BOTTOM_RIGHT
              });
              return null;
            }
            return res.json()})
          .then((res) => {
              if(res){
                toast.error(res['detail'], {
                  position: toast.POSITION.BOTTOM_RIGHT
                });
              }
            closeModal();
          });
      } else {
        toast.error("Explain the reasoning behind the report!", {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      }
    }

    const reportWorldTab = (
      <>
        <DialogTitle id="form-dialog-title">Report World</DialogTitle>
        <DialogContent>
        <DialogContentText>
          Please give some feedback on why you want to report this world.
        </DialogContentText>

        <TextField
          id="report-world-comment"
          label="Comment"
          style={{ margin: 8 }}
          placeholder="Report Reason..."
          fullWidth
          multiline={true}
          rows={3}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          variant="filled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal} color="secondary">
          Cancel
        </Button>
        <Button
            variant="contained"
            className="primary"
            onClick={reportWorld}
            style={{color: 'white'}}
        >
            Send
        </Button>
      </DialogActions>
    </>
  )


    return (
      <div>
        <ThemeProvider theme={theme2}>
        <CssBaseline />
        <Dialog open={open} onClose={closeModal} aria-labelledby="form-dialog-title">
        { inside_world ? 
            <div className={classes.root}>
              <AppBar position="static" color="default">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label="Report a User" {...a11yProps(0)} />
                  <Tab label="Report World" {...a11yProps(1)} />
                </Tabs>
              </AppBar>
              <SwipeableViews
                axis={theme2.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
              >
                <TabPanel value={value} index={0} dir={theme2.direction}>
                  
                <DialogTitle id="form-dialog-title">Report a User</DialogTitle>
                <DialogContent>

                  <FormControl required className={classes2.formControl}>
                      <InputLabel htmlFor="user_id-native-required">User</InputLabel>
                      <Select
                        native
                        value={userToReport}
                        onChange={handleChange2}
                        name="user_id"
                        inputProps={{
                          id: 'user_id-native-required',
                        }}
                        >
                        <option aria-label="None" value="" />
                        {users && Object.keys(users).map((user_id, index) => (
                          <option key={index} value={user_id}>{useWorldUserStore.getState().users_info[user_id].username}</option>
                        ))}
                      </Select>
                      <FormHelperText>Required</FormHelperText>
                    </FormControl>

                  <DialogContentText>
                    Please give some feedback on why you want to report this user
                  </DialogContentText>
                  
                  <TextField
                    id="report-user-comment"
                    label="Comment"
                    style={{ margin: 8 }}
                    placeholder="Report Reason..."
                    fullWidth
                    multiline={true}
                    rows={3}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="filled"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeModal} color="secondary">
                    Cancel
                  </Button>
                  <Button
                      variant="contained"
                      className="primary"
                      onClick={reportUser}
                      style={{color: 'white'}}
                  >
                      Send
                  </Button>
                </DialogActions>

                </TabPanel>
                <TabPanel value={value} index={1} dir={theme2.direction}>
                  {reportWorldTab}
                </TabPanel>
              </SwipeableViews>
            </div>
          :
            <>
              <DialogTitle id="form-dialog-title">Report World</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Please give some feedback on why you want to report this world.
                </DialogContentText>
        
                <TextField
                  id="report-world-comment"
                  label="Comment"
                  style={{ margin: 8 }}
                  placeholder="Report Reason..."
                  fullWidth
                  multiline={true}
                  rows={3}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="filled"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={closeModal} color="secondary">
                  Cancel
                </Button>
                <Button
                    variant="contained"
                    className="primary"
                    onClick={reportWorld}
                    style={{color: 'white'}}
                >
                    Send
                </Button>
              </DialogActions>
            </>
        }
        </Dialog>
        </ThemeProvider>
      </div>
    );
}

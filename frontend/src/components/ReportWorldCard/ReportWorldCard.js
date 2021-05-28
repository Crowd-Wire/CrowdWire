import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Icon from '@material-ui/core/Icon';
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import ReportService from "../../services/ReportService.js";
import { toast } from 'react-toastify';

export default function ReportWorldCard(props) {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
    
    const theme = createMuiTheme({
      palette: {
        type: "dark"
      }
    });

    const handleSubmit = () => {
      let comment = document.getElementById("report-comment").value;
      
      console.log(comment);
      ReportService.sendWorldReport(1, comment)
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
            
          setOpen(false);
        });
    }


    return (
      <div>
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Report
        </Button>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Report World</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please give some feedback on why you want to report the world "{props.world_name}"
            </DialogContentText>
            
            <TextField
              id="report-comment"
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
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button
                variant="contained"
                color="primary"
                className="primary"
                endIcon={<Icon>send</Icon>}
                onClick={handleSubmit}
            >
                Send
            </Button>
          </DialogActions>
        </Dialog>
        </ThemeProvider>
      </div>
    );
}
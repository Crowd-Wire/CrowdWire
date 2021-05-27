import React from 'react';
import Button from 'react-bootstrap/Button';
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


interface ReportWorldCardProps {
  open: boolean;
  closeModal: any;
  world_name: string;
  world_id: any;
}

export const ReportWorldCard: React.FC<ReportWorldCardProps> = ({open, closeModal, world_name, world_id}) => {
    const theme = createMuiTheme({
      palette: {
        type: "dark"
      }
    });

    const handleSubmit = () => {
      //@ts-ignore
      let comment = document.getElementById("report-comment").value;
      console.log(comment);
      if (comment != "") {
        ReportService.sendWorldReport(world_id, comment)
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


    return (
      <div>
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dialog open={open} onClose={closeModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Report World</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please give some feedback on why you want to report the world {world_name}
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
            <Button onClick={closeModal} color="secondary">
              Cancel
            </Button>
            <Button
                variant="contained"
                className="primary"
                onClick={handleSubmit}
                style={{color: 'white'}}
            >
                Send
            </Button>
          </DialogActions>
        </Dialog>
        </ThemeProvider>
      </div>
    );
}
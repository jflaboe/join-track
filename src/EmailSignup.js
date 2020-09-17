import React, { useState } from 'react'
import { joinListserv } from './Actions'
import { setCookie } from './CookieUtil'
import { Container, Grid, Button, TextField, withStyles, Dialog, DialogTitle, DialogContentText, DialogActions, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

var NewButton = withStyles({
  root: {
    backgroundColor: "rgb(110, 2, 250)",
    color: "white"
  }
})(Button);

export default function EmailSignup(props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false)

      return (
        <Container>
          <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
            <Grid item>
              <h1 align='center' className="title">Northwestern University Track Club</h1>
            </Grid>
            
            
            <Grid item>
              <h2 align='center' className="description">Welcome to NUTC! When you sign up for the Listserv, you'll receive emails for weekly workouts, meet signups, and other events the club hosts. </h2>
            </Grid>
            
            <Grid item>
              <Grid container direction="column" className='muiForm'>
                <Grid item>
                  <TextField label="First Name" onChange={(event) => {setFirstName(event.target.value)}} variant="filled" color="secondary" name="first" value={firstName}>{firstName}</TextField>
                </Grid>
              </Grid>
              <Grid container direction="column" className='muiForm'>
                <Grid item>
                  <TextField color="secondary" label="Last Name" onChange={(event) => {setLastName(event.target.value)}} variant="filled" name="last" value={lastName}>{lastName}</TextField>
                </Grid>
              </Grid>
              <Grid container direction="column" alignItems="center" className='muiForm'>
                <Grid item>
                <Button color="primary" onClick={() => {setDialogOpen(true)}} variant='contained'>Join the Listserv</Button>
                </Grid>
              </Grid> 
              
            </Grid>
          </Grid>
          <Dialog open={dialogOpen} onClose={()=>{setDialogOpen(false)}} >
            <DialogTitle>Please Read Carefully</DialogTitle>
            <DialogContentText>
              <List>
                
              <ListItem><ListItemText primary="By clicking 'Continue' below, the following will occur:" /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="This site will ask for authorization to your gmail account. IMPORTANT: select your @u.northwestern.edu account." /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="This site will generate and send an email on your behalf to the Northwestern ListServ system that subscribes you to the TRACK email list." /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="The google authorization data you provide will be used as verification of your Northwestern student identity in later steps." /></ListItem>
              </List>
            </DialogContentText>
            <DialogActions>
              <Button color="primary" onClick={() => {joinListserv(firstName, lastName, props.onCompletion)}} variant='contained'>Continue</Button>
            </DialogActions>
          </Dialog>
        </Container>
      );
}
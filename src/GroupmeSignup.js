import React, { useState } from 'react'
import { Container, Grid, Button, Dialog, DialogTitle, DialogContentText, DialogActions, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

export default function GroupmeSignup(props){
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
      <Container>
        <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
            <Grid item>
              <h1 align='center' className="title">Northwestern University Track Club</h1>
            </Grid>
            <Grid item>
              <h2 align="center" className="description">We use GroupMe for day-to-day communications, such as last minute practice details, coordination for non-scheduled runs as well information about club social events!</h2>
              
            </Grid>
            <Grid item>
              <Button color="primary" variant="contained" onClick={()=>{setDialogOpen(true)}} >Join our GroupMe Now!</Button>
            </Grid>

        </Grid>
        <Dialog open={dialogOpen} onClose={()=>{setDialogOpen(false)}} >
            <DialogTitle>Please Read Carefully</DialogTitle>
            <DialogContentText>
              <List>
                
              <ListItem><ListItemText primary="By clicking 'Continue' below, the following will occur:" /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="You will be redirected through GroupMe to give this site authorization to view your GroupMe information." /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="Once you sign-in to GroupMe, you will be redirected back to this site" /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="Your GroupMe and Google authorization data will be sent to a back-end server so that: (1) We can authorize that you are the owner of a Northwestern email address, (2) We can add the user associated with your GroupMe ID to our GroupMe" /></ListItem>
              </List>
            </DialogContentText>
            <DialogActions>
              <Button color="primary" onClick={() => {window.location.replace("https://oauth.groupme.com/oauth/authorize?client_id=ddkYFa6rYCTWuG4FrpSxSQ4xXkiUQ0b5QobUDUBhN0TIlkbc")}} variant='contained'>Continue</Button>
            </DialogActions>
          </Dialog>
      </Container>);
}
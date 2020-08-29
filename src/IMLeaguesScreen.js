import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Dialog, DialogTitle, DialogContentText, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

export default function IMLeaguesScreen(props){
  const [dialogOpen, setDialogOpen] = useState(false);

  return(
    <Container>
          <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
            <Grid item>
              <h1 align='center' className="title">Northwestern University Track Club</h1>
            </Grid>
            
            
            <Grid item>
              <h2 align='center' className="description">Congrats! You should have been added to both our Listserv and GroupMe. If you're interested in running meets, please go to IMLeagues and join our club page there.</h2>
            </Grid>
            
            
              
            <Grid item>
                <Button color="primary" onClick={() => {setDialogOpen(true)}} variant='contained'>Take me to IMLeagues</Button>
            </Grid>
               
              
            
          </Grid>
          <Dialog open={dialogOpen} onClose={()=>{setDialogOpen(false)}} >
            <DialogTitle>Please Read Carefully</DialogTitle>
            <DialogContentText>
              <List>
                
              <ListItem><ListItemText primary="When you proceed to IMLeagues, please do the following:" /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="Choose Northwestern University as your school and sign in via SSO." /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="Navigate to 'Sports Clubs' and find the club listed as 'Track.' Join the club." /></ListItem>
                <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText primary="Complete the Health History Questionnaire. This is necessary if you want to compete." /></ListItem>
              </List>
            </DialogContentText>
            <Button color="primary" onClick={() => {window.location.replace("https://www.imleagues.com/spa/account/login")}} variant='contained'>Proceed to IMLeagues</Button>
            
          </Dialog>
        </Container>
  )
}
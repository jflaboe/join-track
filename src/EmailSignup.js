import React, { useState } from 'react'
import { joinListserv } from './Actions'
import { setCookie } from './CookieUtil'
import { Container, Grid, Button, TextField } from '@material-ui/core';

export default function EmailSignup(props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

      return (
        <Container>
          <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
            <Grid item>
              <h1 align='center' className="title">Northwestern Track Club</h1>
            </Grid>
            
            
            <Grid item>
              <h2 align='center' className="description">Welcome to NUTC! When you sign up for the Listserv, you'll receive emails for weekly workouts, meet signups, and other events the club hosts. </h2>
            </Grid>
            
            <Grid item>
              <Grid container direction="column" className='muiForm'>
                <Grid item>
                  <p className="textinputlabel">First name</p>
                </Grid>
                <Grid item>
                  <TextField onChange={(event) => {setFirstName(event.target.value)}} variant="outlined" name="first" value={firstName}>{firstName}</TextField>
                </Grid>
              </Grid>
              <Grid container direction="column" className='muiForm'>
                <Grid item>
                  <p className="textinputlabel">Last name</p>
                </Grid>
                <Grid item>
                  <TextField onChange={(event) => {setLastName(event.target.value)}} variant="outlined" name="last" value={lastName}>{lastName}</TextField>
                </Grid>
              </Grid>
              <Grid container direction="column" alignItems="center" className='muiForm'>
                <Grid item>
                <Button onClick={() => {joinListserv(firstName, lastName, () => {props.setSignedUpForListServ(true); setCookie('listServ', 'yes', 1);})}} variant='outlined'>Join the Listserv</Button>
                </Grid>
              </Grid> 
              
            </Grid>
          </Grid>
        </Container>
      );
}
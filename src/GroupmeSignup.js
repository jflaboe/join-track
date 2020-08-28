import React from 'react'
import { Container, Grid, Button } from '@material-ui/core';
export default function GroupmeSignup(props){


    return (
      <Container>
        <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
            <Grid item>
              <h2>Sign up for our GroupMe</h2>
            </Grid>
            <Grid item>
              <Button onClick={()=>{window.location.replace("https://oauth.groupme.com/oauth/authorize?client_id=ddkYFa6rYCTWuG4FrpSxSQ4xXkiUQ0b5QobUDUBhN0TIlkbc")}} >Sign up here</Button>
            </Grid>

        </Grid>
      </Container>);
}
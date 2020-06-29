import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { Container, Typography, Grid, Button, TextField } from '@material-ui/core';
import './App.css';
import { gapi } from 'gapi-script';
import { Base64 } from 'js-base64'

const CLIENT_ID = '1087799332107-pj33egdhuog61uuqjgrk5cldmhugfo1e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBHDU4P02PzipwKu4GYJz4yErS4_EDldp8';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = 'https://www.googleapis.com/auth/gmail.compose';

function setCookie(cname, cvalue, expires) {
  document.cookie = cname + "=" + cvalue + ";" + expires.toString() + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function loadClient() {
  gapi.load('client:auth2', initClient);
}

function createEmail(to, from, subject, message) {
  let email = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "to: ", to, "\n",
    "from: ", from, "\n",
    "subject: ", subject, "\n\n",
    message
  ].join('');

  return Base64.encodeURI(email);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    console.log("Google API initialized");
  }, function (error) {
    console.log(error)
    console.log("error initializing api");
  });
}
loadClient();


function App() {
  const [gmAccessToken, setgmAccessToken] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signedUpForListServ, setSignedUpForListServ] = useState(null);
  const [signedUpForGroupMe, setSignedUpForGroupMe] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('access_token')) {
      console.log(params.get('access_token'))
      setgmAccessToken(params.get('access_token'))
    }
  }, [])

  const joinListserv = () => {
    
    const listServSubscribe =  () => {
      const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
      console.log(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true));

      gapi.client.gmail.users.getProfile({ 'userId': userId }).execute((response) => {
        console.log(response)
        var request = gapi.client.gmail.users.drafts.create({
          'userId': userId,
          'resource': {
            'message': {
              'raw': createEmail(
                "listserv@listserv.it.northwestern.edu",
                response.emailAddress,
                "",
                "SUBSCRIBE TRACK " + firstName + " " + lastName
              )
            }
          }
        });
        if (!response.emailAddress.includes("northwestern.edu")) {
          gapi.auth2.getAuthInstance().signOut()
          return
        }
        request.execute((response) => {
          var request2 = gapi.client.gmail.users.drafts.send({
            'userId': userId,
            'resource': {
              'id': response.id
            }
          });
          request2.execute((resp2) => {
            console.log(resp2);
            setSignedUpForListServ(true);
          })

        })
      });
    }
    gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn);
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      setIsSignedIn(true);
      listServSubscribe();
    } else {
      gapi.auth2.getAuthInstance().signIn().then(() => {listServSubscribe()})
    }
  }
  return (
    <Container>
      <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
        <Grid item>
          <h1 align='center' className="title">Northwestern Track Club</h1>
        </Grid>
        {/*start of mike's changes*/}
        <Grid item>
          <h2 align='center' className='description'>Welcome to NUTC! When you sign up for the Listserv, you'll receive emails for weekly workouts, meet signups, and other events the club hosts. </h2>
        </Grid>
        {/*end of mike's changes*/}
        <Grid item>
          <Grid container direction="column" alignItems="space-evenly" className='muiForm'>
            <Grid item>
              <p className="textinputlabel">First name</p>
            </Grid>
            <Grid item>
              <TextField onChange={(event) => {setFirstName(event.target.value)}} variant="outlined" name="first" value={firstName}>{firstName}</TextField>
            </Grid>
          </Grid>
          <Grid container direction="column" alignItems="space-evenly" className='muiForm'>
            <Grid item>
              <p className="textinputlabel">Last name</p>
            </Grid>
            <Grid item>
              <TextField onChange={(event) => {setLastName(event.target.value)}} variant="outlined" name="last" value={lastName}>{lastName}</TextField>
            </Grid>
          </Grid>
          <Grid container direction="column" alignItems="center" className='muiForm'>
            <Grid item>
            <Button onClick={joinListserv} variant='outlined'>Join the Listserv</Button>
            </Grid>
          </Grid>
          
        </Grid>
      </Grid>
    </Container>
  );
}
export default App;

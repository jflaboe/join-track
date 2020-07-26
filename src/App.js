import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, TextField } from '@material-ui/core';
import './App.css';
import { gapi } from 'gapi-script';
import { Base64 } from 'js-base64'

const CLIENT_ID = '1087799332107-pj33egdhuog61uuqjgrk5cldmhugfo1e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBHDU4P02PzipwKu4GYJz4yErS4_EDldp8';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = 'https://www.googleapis.com/auth/gmail.compose';
const API_ENDPOINT = process.env.REACT_APP_ENDPOINT

function setCookie(name,value,days,sameSite=true) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  if (sameSite){
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
  else {
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=None";
  }
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function eraseCookie(name) {   
  document.cookie = name+'=; Max-Age=-99999999;';  
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

function App() {
  const [gmAccessToken, setgmAccessToken] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signedUpForListServ, setSignedUpForListServ] = useState(null);
  const [signedUpForGroupMe, setSignedUpForGroupMe] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const joinGroupMe = (gmToken) => {
    const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
    const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
    console.log(gmToken);
    console.log(API_ENDPOINT);
    var userData = {
      'userId': userId,
      'googleAccessToken': googleAccessToken, 
      'gmAccessToken': gmAccessToken
    };
    fetch("http://localhost:3001/addtogroupme",
      {method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(userData)
      }
    ) 
      .then(resp => resp.json())
      .then(() => {
        console.log('Success');
      });
      

    //if (resp.ok)
      //console.log("Sucessfully added to GroupMe");
  } 

  useEffect(() => {
    gapi.load('client:auth2', function() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(function () {
        // Listen for sign-in state changes.
        console.log("Google API initialized");
        
        const params = new URLSearchParams(window.location.search)
        console.log(params.has('access_token'))
        if (params.has('access_token')) {
          console.log("hello")
          setgmAccessToken(params.get('access_token'))
          joinGroupMe(params.get('access_token'));
        }
        if (getCookie('listServ') === 'yes'){
          setSignedUpForListServ(true)
        
        }
      }, function (error) {
        console.log(error)
        console.log("error initializing api");
      });
    })
    
    
  }, [])
  const joinListserv = () => {
    const getGoogleAccessToken = () => {
      return gapi.auth2.getAuthInstance().currentUser.get().AuthResponse(true);
    }
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
            setCookie('listServ', 'yes', 1)
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
        
        {!signedUpForListServ &&
        <React.Fragment>
        <Grid item>
          <h2 align='center' className="description">Welcome to NUTC! When you sign up for the Listserv, you'll receive emails for weekly workouts, meet signups, and other events the club hosts. </h2>
        </Grid>
        
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
          
        </Grid> </React.Fragment> }
        {(signedUpForListServ && !gmAccessToken) && 
        <React.Fragment>
          <Grid item>
            <h2>Sign up for our GroupMe</h2>
          </Grid>
          <Grid item>
            <Button onClick={()=>{window.location.replace("https://oauth.groupme.com/oauth/authorize?client_id=ddkYFa6rYCTWuG4FrpSxSQ4xXkiUQ0b5QobUDUBhN0TIlkbc")}} >Sign up here</Button>
          </Grid>

        </React.Fragment>}
      </Grid>
    </Container>
  );
}
export default App;

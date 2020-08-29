import React, { useState, useEffect } from 'react';
import { Backdrop, CircularProgress, Container, Button } from '@material-ui/core'
import './App.css';
import { gapi } from 'gapi-script';
import { setCookie, getCookie } from './CookieUtil'
import { joinGroupMe } from './Actions'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import EmailSignup from './EmailSignup';
import GroupmeSignup from './GroupmeSignup'
import { useLocalStorage } from './CustomHooks'

const CLIENT_ID = '1087799332107-pj33egdhuog61uuqjgrk5cldmhugfo1e.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = 'https://www.googleapis.com/auth/gmail.compose';



function LoadingScreen(props){
  
  return(
    <Container>
      <Backdrop className="loading" open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  )
}

function App() {
  const [stepsCompleted, setStepsCompleted] = useLocalStorage("stepsCompleted", 0)
  const [gmAccessToken, setgmAccessToken] = useState(null);
  const [signedUpForListServ, setSignedUpForListServ] = useState(false);
  const [signedUpForGroupMe, setSignedUpForGroupMe] = useState(false);
  const [gapiReady, setGapiReady] = useState(false);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    gapi.load('client:auth2', function() {
      gapi.client.init({
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(function () {
        // Listen for sign-in state changes.
        console.log("Google API initialized");
        setGapiReady(true);
        
        const params = new URLSearchParams(window.location.search)
        if (params.has('access_token')) {
          console.log("access token available")
          setStepsCompleted(2)
          setCookie('gmAccessToken', params.get('access_token'));
          setgmAccessToken(params.get('access_token'))
          
          joinGroupMe(params.get('access_token'), ()=>{setStepsCompleted(3)});
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
  
  return (
  
    <Router>
      <Switch>
        <Route path="/admin">
          <div>hello</div>
        </Route>
        <Route path="/">

          <Button onClick={()=>{setStepsCompleted(0); gapi.auth2.getAuthInstance().signOut()}}>Start Over </Button>
          {stepsCompleted === 0 && <EmailSignup onCompletion={()=>{setStepsCompleted(1)}}/>}
          {stepsCompleted === 1 && <GroupmeSignup />}
          {stepsCompleted === 2 && <LoadingScreen />}
        </Route>
      </Switch>
    </Router>
  );
}
export default App;
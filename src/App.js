import React, { useState, useEffect } from 'react';

import './App.css';
import { gapi } from 'gapi-script';
import { getCookie } from './CookieUtil'
import { joinGroupMe } from './Actions'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import EmailSignup from './EmailSignup';
import GroupmeSignup from './GroupmeSignup'

const CLIENT_ID = '1087799332107-pj33egdhuog61uuqjgrk5cldmhugfo1e.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = 'https://www.googleapis.com/auth/gmail.compose';

function App() {
  const [gmAccessToken, setgmAccessToken] = useState(null);
  const [signedUpForListServ, setSignedUpForListServ] = useState(false);
  const [signedUpForGroupMe, setSignedUpForGroupMe] = useState(false);
  const [gapiReady, setGapiReady] = useState(false);

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
          setgmAccessToken(params.get('access_token'))
          joinGroupMe(params.get('access_token'), ()=>{setSignedUpForGroupMe(true)});
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
          <div></div>
        </Route>
        <Route path="/">
          
          {!signedUpForListServ && <EmailSignup setSignedUpForListServ={setSignedUpForListServ}/>}
          {signedUpForListServ && !gmAccessToken && <GroupmeSignup />}
          {gmAccessToken && !signedUpForGroupMe}
        </Route>
      </Switch>
    </Router>
  );
}
export default App;
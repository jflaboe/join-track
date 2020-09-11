import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Backdrop, CircularProgress, Container, Drawer, ThemeProvider, Fab,  Button, List, ListItem, ListItemText } from '@material-ui/core'
import './App.css';
import { gapi } from 'gapi-script';
import { setCookie, getCookie } from './CookieUtil'
import { joinGroupMe } from './Actions'
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import EmailSignup from './EmailSignup';
import GroupmeSignup from './GroupmeSignup'
import { useLocalStorage } from './CustomHooks'
import img from './nutc1_cropped.jpg';
import theme from './Palette';
import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';
import IMLeaguesScreen from './IMLeaguesScreen';
import PrivacyPolicy from './PrivacyPolicy';
import Admin from './Admin';

const CLIENT_ID = '192540793955-ptloq8bg4d7s8drel47qqmq7kdchdjfl.apps.googleusercontent.com';
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
  const history = useHistory();
  const [stepsCompleted, setStepsCompleted] = useLocalStorage("stepsCompleted", 0)
  const [gapiReady, setGapiReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  

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
          joinGroupMe(params.get('access_token'), ()=>{setStepsCompleted(3)});
        }
      }, function (error) {
        console.log(error)
        console.log("error initializing api");
      });
    })
    
    
  }, [])
  

  function restart(){
    setStepsCompleted(0);
    gapi.auth2.getAuthInstance().signOut()
  }

  return (
    <ThemeProvider theme={theme}>
      <Drawer anchor="left" open={menuOpen}>
        <Button onClick={()=>{setMenuOpen(!menuOpen)}}><ClearIcon color="primary"/></Button>
        <List>
          <ListItem button onClick={()=>{window.history.pushState({}, "Join Track", window.location.href); window.location.replace('https://sites.northwestern.edu/runners/')}}><ListItemText primary="Learn More about NUTC"/></ListItem>
          <ListItem button onClick={()=>{window.history.pushState({}, "Join Track", window.location.href); window.location.replace('/')}}><ListItemText primary="Home" /></ListItem>
          <ListItem button onClick={()=>{window.history.pushState({}, "Join Track", window.location.href); window.location.replace('/admin')}}><ListItemText primary="Admin"/></ListItem>
          <ListItem button onClick={()=>{window.history.pushState({}, "Join Track", window.location.href); window.location.replace('/privacy-policy')}}><ListItemText primary="Privacy Policy" /></ListItem>
          <ListItem button onClick={restart}><ListItemText primary="Restart Signup"/></ListItem>
        </List>
      </Drawer>
      <Fab onClick={()=>{setMenuOpen(!menuOpen)}}><MenuIcon color="primary"/></Fab>
    <Router>
      <Switch>
        <Route path="/privacy-policy">
          <PrivacyPolicy />
        </Route>
        <Route path="/admin">
          <Admin />
        </Route>
        <Route path="/">
        <Stepper activeStep={stepsCompleted} alternativeLabel>
            <Step completed={stepsCompleted > 0}>
              <StepLabel>Join the Listserv</StepLabel>
            </Step>
            <Step completed={stepsCompleted > 2}>
              <StepLabel>Join the GroupMe</StepLabel>
            </Step>
            <Step completed={stepsCompleted > 3}>
              <StepLabel>Join IMLeagues</StepLabel>
            </Step>
          </Stepper>
          {stepsCompleted === 0 && <EmailSignup onCompletion={()=>{setStepsCompleted(1)}}/>}
          {stepsCompleted === 1 && <GroupmeSignup />}
          {stepsCompleted === 2 && <LoadingScreen />}
          {stepsCompleted === 3 && <IMLeaguesScreen />}
          
        </Route>
      </Switch>
    </Router>
    </ThemeProvider>
  );
}
export default App;
import { gapi } from 'gapi-script';
import { createEmail } from './EmailUtil'

const API_ENDPOINT = process.env.REACT_APP_ENDPOINT;

function joinGroupMe(gmToken, callback){
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      
    gapi.auth2.getAuthInstance().signIn().then(() => {joinGroupMe(gmToken, callback)})
    return
  }
    
    const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
    
    var userData = {
      'googleAccessToken': googleAccessToken, 
      'gmAccessToken': gmToken
    };
    fetch(API_ENDPOINT + "/addtogroupme",
      {
      method: 'POST',
      body: JSON.stringify(userData)
      }
    ) 
      
      .then((resp) => {
        if (resp.ok){
          callback()
          console.log('Success');
        } else if (resp.status === 403) {
          alert("You are not authorized to use this page due to past behavior")
        } else {
          alert("HTTP-Error:" + resp.status)
        }
      });
      

    //if (resp.ok)
      //console.log("Sucessfully added to GroupMe");
  }

function joinListserv(firstName, lastName, callback) {
    const listServSubscribe =  () => {

      const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;

      var userData = {
        'access_token': googleAccessToken,
        'first': firstName,
        'last': lastName 
      };
      fetch(API_ENDPOINT + "/addtolistserv",
        {
        method: 'POST',
        body: JSON.stringify(userData)
        }
      ) 
        
        .then((resp) => {
          if (resp.ok){
            callback()
            console.log('Success');
          } else if (resp.status === 403) {
            alert("You are not authorized to use this page due to past behavior")
          } else {
            alert("HTTP-Error:" + resp.status)
          }
        });

      
      

    }
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      
      listServSubscribe();
    } else {
      gapi.auth2.getAuthInstance().signIn().then(() => {listServSubscribe()})
    }
  }

export {
    joinGroupMe,
    joinListserv
}
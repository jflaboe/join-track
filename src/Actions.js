import { gapi } from 'gapi-script';
import { createEmail } from './EmailUtil'

const API_ENDPOINT = process.env.REACT_APP_ENDPOINT

function joinGroupMe(gmToken, callback){
    const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
    const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
    
    var userData = {
      'userId': userId,
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
        } 
      });
      

    //if (resp.ok)
      //console.log("Sucessfully added to GroupMe");
  }

function joinListserv(firstName, lastName, callback) {
    const listServSubscribe =  () => {

      const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
      const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;

      var userData = {
        'user_id': userId,
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
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
            callback()
            
            
          })

        })
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
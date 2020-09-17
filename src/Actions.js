import { gapi } from 'gapi-script';
import { createEmail } from './EmailUtil'

const API_ENDPOINT = process.env.REACT_APP_ENDPOINT

async function joinGroupMe(gmToken, callback){
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      
    gapi.auth2.getAuthInstance().signIn().then(() => {joinGroupMe(gmToken, callback)})
    return
  }

  var blacklisted = await isBlacklisted(gmToken, "groupme ID")
  console.log(blacklisted);
  if (blacklisted) {
    alert("You are not authorized to join the GroupMe due to past behavior");
    return
  }
    const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
    const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;

    var userData = {
      'userId': userId,
      'googleAccessToken': googleAccessToken, 
      'gmAccessToken': gmToken
    }

    fetch(API_ENDPOINT + "/addtogroupme",
      {
      method: 'POST',
      body: JSON.stringify(userData)
      }
    ) 
      
      .then((resp) => {
        if (resp.ok){
          //can't test this due to how we have the GM authentication set up
          addEvent(userId, googleAccessToken, gmToken);
          callback();
          console.log('Success');
        } 
      });
  }

function joinListserv(firstName, lastName, callback) {
    const listServSubscribe =  () => {

      const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
      const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
<<<<<<< HEAD
      console.log(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true));

      gapi.client.gmail.users.getProfile({ 'userId': userId }).execute(async (response) => {
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
        var blacklisted = await isBlacklisted(response.emailAddress, "email");
        console.log(blacklisted);
        if (blacklisted) {
          gapi.auth2.getAuthInstance().signOut();
          alert("You are not authorized to use this page due to past behavior");
          return
        }
        if (!response.emailAddress.includes("northwestern.edu")) {
          alert("You must use your @u.northwestern.edu email")
          gapi.auth2.getAuthInstance().signOut()
          return
=======

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
>>>>>>> 0ac3078eb69d1320a3709167b220262fc774ed15
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

//check if the user is blacklisted when they try to sign up for the ListServ and 
// again for the GroupMe
async function isBlacklisted(user_id, id_type) {
  
  var userData = {
    'userId': user_id,
    'idType': id_type
  };
  // **
  ////need to remember to change the api URI after testing
  // **
  var resp = await fetch("http://localhost:3001" + "/isblacklisted",
    {
    method: 'POST',
    body: JSON.stringify(userData)
    }
  ) 
  
  if (resp.ok){
    console.log('Success');
    //**double check this below when we actually have the server. I had to 
    //change it slightly when i used AWS Lambda, idk why.
    var blacklisted = await resp.json();
    console.log(blacklisted);
    return blacklisted;
  } else {
    alert("HTTP-Error: " + resp.status)
  };  
}

async function addEvent(goog_id, goog_token, gm_token) {
  var eventData = {
    'userId': goog_id,
    'googleAccessToken': goog_token, 
    'gmToken': gm_token
  }
  // **
  ////need to remember to change the api URI after testing
  // **
  var resp = await fetch("http://localhost:3001" + "/addevent",
    {
    method: 'POST',
    body: JSON.stringify(eventData)
    }
  );
  
  if (resp.ok) {
    console.log('Success');
  } else {
    alert("HTTP-Error:" + resp.status);
  }
}


export {
    joinGroupMe,
    joinListserv
}
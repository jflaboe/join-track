import React, { useState } from 'react';
import { gapi } from 'gapi-script';
import { Container, Grid, Button, TextField, withStyles, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from '@material-ui/core';

//**for testing**
// const API_ENDPOINT = process.env.REACT_APP_ENDPOINT
const API_ENDPOINT = "http://localhost:3001";


export default function Admin() {
    const [verifiedAdmin, setVerifiedAdmin] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adminInfo, setAdminInfo] = useState([]);
    const [adminDialogOpen, setAdminDialogOpen] = useState(false);
    const [addAdminName, setAddAdminName] = useState("");
    const [blacklistInfo, setBlacklistInfo] = useState([]);
    const [blDialogOpen, setBlDialogOpen] = useState(false);
    const [addBlId, setAddBlId] = useState("");
    const [addBlType, setAddBlType] = useState("");
    const [removeBlId, setRemoveBlId] = useState("");
    const [eventInfo, setEventInfo] = useState([]);
    const [eventDialogOpen, setEventDialogOpen] = useState(false);

    async function isAdmin() {
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
          
          gapi.auth2.getAuthInstance().signIn().then(() => {isAdmin()})
          return
      }
  
      //make an HTTP POST request to the Flask server to determine if the user is an admin
      const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
      const googleAccessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
      
      var userData = {
        'userId': userId,
        'googleAccessToken': googleAccessToken
      };
      var resp = await fetch(API_ENDPOINT + "/verifyadmin",
        {
        method: 'POST',
        body: JSON.stringify(userData)
        }
      ) 
      
      if (resp.ok){
        console.log('Success');
        //**double check this below when we actually have the server. I had to 
        //change it slightly when i used AWS Lambda, idk why.
        var verified = await resp.json();
        console.log(verified);
        setVerifiedAdmin(verified);
        setDialogOpen(!verified);
        if (!verified) {
          gapi.auth2.getAuthInstance().signOut();
        }
      } else {
        alert("HTTP-Error: " + resp.status)
      };  
    }

    async function viewAdmin() {
      var resp = await fetch(API_ENDPOINT + "/viewadmin")

      if (resp.ok) {
        console.log("Success");
        var adminList = await resp.json();
        setAdminInfo(adminList);
        setAdminDialogOpen(true);
      } else {
        alert("HTTP-Error: " + resp.status)
      }; 
    }

    async function addAdmin() {
      if (addAdminName == "" || !addAdminName.endsWith("@u.northwestern.edu")) {
        alert("Please input a valid @u.northwestern.edu email.");
      } else {
        var userData = {
          'userEmail': addAdminName
        }
        var resp = await fetch(API_ENDPOINT + "/addadmin",
          {
          method: 'POST',
          body: JSON.stringify(userData)
          }
        ) 
        
        if (resp.ok){
          console.log('Success');
          //**double check this below when we actually have the server. I had to 
          //change it slightly when i used AWS Lambda, idk why.
          setAddAdminName("");
        } else {
          alert("HTTP-Error: " + resp.status + ". Admins must have a @u.northwestern.edu email")
        }; 
      }
    }

    async function viewBlacklist() {
      var resp = await fetch(API_ENDPOINT + "/viewblacklist")

      if (resp.ok) {
        console.log("Success");
        var blInfo = await resp.json();
        setBlacklistInfo(blInfo);
        setBlDialogOpen(true);
      } else {
        alert("HTTP-Error: " + resp.status)
      }; 
    }

    async function addToBlacklist() {
      if (addBlId == "" || addBlType == "") {
        alert("Please input an ID and ID type.");
      } else {
        var userData = {
          'userID': addBlId,
          'idType': addBlType
        }
        var resp = await fetch(API_ENDPOINT + "/addtoblacklist",
          {
          method: 'POST',
          body: JSON.stringify(userData)
          }
        ) 
        
        if (resp.ok){
          console.log('Success');
          //**double check this below when we actually have the server. I had to 
          //change it slightly when i used AWS Lambda, idk why.
          setAddBlId("");
          setAddBlType("");
        } else {
          alert("HTTP-Error: " + resp.status)
        }; 
      }
    }

    async function removeFromBlacklist() {
      if (removeBlId == "" ) {
        alert("Please input an ID to remove.");
      } else {
        var userData = {
          'userID': removeBlId
        }
        var resp = await fetch(API_ENDPOINT + "/remfromblacklist",
          {
          method: 'POST',
          body: JSON.stringify(userData)
          }
        ) 
        
        if (resp.ok){
          console.log('Success');
          //**double check this below when we actually have the server. I had to 
          //change it slightly when i used AWS Lambda, idk why.
          setRemoveBlId("");
        } else {
          alert("HTTP-Error: " + resp.status)
        }; 
      }
    }

    async function listEvents() {
      var resp = await fetch(API_ENDPOINT + "/listevents");
      if (resp.ok) {
        console.log('Success');
        var events = await resp.json();
        setEventInfo(events);
        setEventDialogOpen(true);
      } else {
        alert('HTTP-Error:' + resp.status);
      }
    }
  

    return (
      <Container>
        <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
          <Grid item>
            <h1 align='center' className="title">Northwestern University Track Club</h1>
          </Grid>
        {!verifiedAdmin && (
          <React.Fragment>
          <Grid item>
            <Button color="primary" variant="contained" onClick={isAdmin}>Click here to verify admin privileges</Button>
          </Grid>
          </React.Fragment>
        )}
        {verifiedAdmin && (
          <Grid container className="adminPg" direction="column" alignItems="center">
          <Grid item>
            <Typography variant="h3" color="secondary">Admin Page</Typography>
          </Grid>
          <Grid container direction="column" alignItems="flex-start" spacing={1}>
            <Grid item>
              <h3>Admin Actions</h3>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center" spacing={2} justify-content="space-evenly">
                <Grid item>
                 View Admins:
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" onClick={viewAdmin}>View Admins</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center" spacing={2} justify-content="space-evenly">
                <Grid item>
                  Add an admin:
                </Grid>
                <Grid item>
                  <TextField onChange={(event) => setAddAdminName(event.target.value)} label="Email" variant="filled" color="secondary" name="addAdmin" value={addAdminName}>{addAdminName}</TextField>
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" onClick={addAdmin}>Add Admin</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="column" alignItems="flex-start" spacing={1}>
            <Grid item>
              <h3>Blacklist Actions</h3>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center" spacing={2} justify-content="space-evenly">
                <Grid item>
                 View blacklist:
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" onClick={viewBlacklist}>View Blacklist</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center" spacing={2} justify-content="space-evenly">
                <Grid item>
                  Add to the blacklist:
                </Grid>
                <Grid item>
                  <TextField onChange={(event) => setAddBlId(event.target.value)} label="ID" variant="filled" color="secondary" name="BlId" value={addBlId}>{addBlId}</TextField>
                </Grid>
                <Grid item>
                  <TextField onChange={(event) => setAddBlType(event.target.value)} label="ID Type" variant="filled" color="secondary" name="BlType" value={addBlType}>{addBlType}</TextField>
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" onClick={addToBlacklist}>Add to Blacklist</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center" spacing={2} justify-content="space-evenly">
              <Grid item>
                  Remove from the blacklist:
                </Grid>
                <Grid item>
                  <TextField onChange={(event) => setRemoveBlId(event.target.value)} label="ID" variant="filled" color="secondary" name="removeBlId" value={removeBlId}>{removeBlId}</TextField>
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" onClick={removeFromBlacklist}>Remove From Blacklist</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="column" alignItems="flex-start" spacing={1}>
            <Grid item>
              <h3>User Events</h3>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center" spacing={2} justify-content="space-evenly">
                <Grid item>
                 View User List:
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" onClick={listEvents}>View User List</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          </Grid>
        )}
        </Grid>
        <Dialog open={dialogOpen} onClose={()=>{setDialogOpen(false)}} >
          <DialogTitle>Sorry!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You're not an admin, so you can't access this page. If you think this is a mistake, make sure you're logged
              in to your @u.northwestern.edu email and/or contact Mike Luvin or John Laboe.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant='contained' onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={adminDialogOpen} onClose={()=>{setAdminDialogOpen(false)}}>
          <DialogTitle>Admins</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminInfo.map((email, i) => (
                    <TableRow key={i}>
                      <TableCell align="left">{email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant='contained' onClick={() => setAdminDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={blDialogOpen} onClose={()=>{setBlDialogOpen(false)}}>
          <DialogTitle>Blacklist</DialogTitle>
          <DialogContent>
            {blacklistInfo.length != 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">ID</TableCell>
                    <TableCell align="right">ID Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blacklistInfo.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell align="left">{row[0]}</TableCell>
                      <TableCell align="right">{row[1]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )}
            {blacklistInfo.length == 0 && (
              <DialogContentText>
                There appears to be no one on the blacklist at this time.
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant='contained' onClick={() => setBlDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={eventDialogOpen} onClose={()=>{setEventDialogOpen(false)}}>
          <DialogTitle>Page Users</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="left">GM ID</TableCell>
                    <TableCell align="left">Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventInfo.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell align="left">{row[0]}</TableCell>
                      <TableCell align="left">{row[1]}</TableCell>
                      <TableCell align="left">{row[2]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant='contained' onClick={() => setEventDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

      </Container>
    )
}
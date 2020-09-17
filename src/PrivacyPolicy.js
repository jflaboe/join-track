import React from 'react';
import { Grid, Container } from '@material-ui/core'

export default function PrivacyPolicy(props) {
    return (
        <Container>
          <Grid className="main" container direction="column" justify-content="space-evenly" alignItems="center">
            <Grid item>
              <h1 align='center' className="title">Privacy Policy</h1>
            </Grid>
            
            
            <Grid item>
              <p className="policy">This site (jointrack.club) will ask for authorization to access your Google account. In addition to basic access such as viewing your email address and basic info, jointrack.club requires authentication to create/send drafts and emails from your account. 
              <br/><br/>This site (jointrack.club) will create and send an email to the Northwestern listserv that subscribes the user to the TRACK mailing list. No other emails will be created or sent, nor will your mailbox be read by this application. In the second stage (when you sign up for the GroupMe), this site will send the access token -- obtained when you gave Google account access to this site -- to a backend server. There, the server will use the token to verify your identity by checking if your email has the u.northwestern.edu domain. 
              <br/><br/>Admins of the site will have their access token sent for all Admin actions (edit admins, blacklist email, blacklist GroupMe ID, etc) so that the user can be verified as an Administrator
              <br/><br/>This site (jointrack.club) will ask for authentication to access your GroupMe account. For non-Administrators, we will only use access to your GroupMe account to view your GroupMe ID, so that we may add you to our GroupMe. If your GroupMe ID is associated with malicious behavior in the GroupMe, it may be blacklisted from this site.
              <br/><br/>Admins will also provide this site (jointrack.club) access to their GroupMe account in order to edit the GroupMe group that needs to be added to or edit the user who will be seen as adding new members to the GroupMe.</p>
            </Grid>
            
            
          </Grid>
        </Container>
    );
}
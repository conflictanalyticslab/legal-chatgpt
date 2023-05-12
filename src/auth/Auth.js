import * as Msal from 'msal';
import React, { Component } from "react";
import { AuthProvider } from "./authContext";


const DEPLOY_URL = 'openjustice-test.azurewebsites.net';

//switches our redirect uri to local host, though we could get this dynamically instead.
let redirectUri = `https://${DEPLOY_URL}.azurewebsites.net/callback`;
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    redirectUri = "http://" + window.location.host + '/callback';
}


// Our MSAL config file which we'll use to get our token:
let msalConfig = {
    auth: {
        clientId: '<Your App Client Id>',
        authority: 'https://login.microsoftonline.com/<Your App Tenant Id>/', //tenantId
        redirectUri: redirectUri
    },
    cache: {
        cacheLocation: "localStorage",//keeps login token across sites
        storeAuthStateInCookie: true //stores the auth state in your cache
    }
};

//Our React component
class Auth extends Component {
    //create a new msal instance and store it as a property of this component
    msalInstance = new Msal.UserAgentApplication(msalConfig);

    
    componentDidMount() {
        //try and get our token from the cache first.
        this.initiateLoginIfCached();      
    }

    state = {
        authenticated: false,
        user: {
            role: "visitor"
        },
        accessToken: ""
    };

//tries to aquire the token from the cache and logs in if possible
    initiateLoginIfCached = () => {
        let loginRequest = {
            scopes: ["user.read"] // optional Array<string>
        };
        this.msalInstance.acquireTokenSilent(loginRequest)
            .then(res => {
                this.setSession(res.idToken);
            })
            .catch(err => {
                console.log(err);
            })
    }
//tries to acquire the token from the cache and if fails prompts the user to login.
    initiateLogin = () => {
        let loginRequest = {
            scopes: ["user.read"] // optional Array<string>
        };
        this.msalInstance.acquireTokenSilent(loginRequest)
            .then(res => {
                this.setSession(res.idToken);
            })
            .catch(err => {
                this.msalInstance.loginPopup(loginRequest).then(res => {
                    this.setSession(res.idToken)
                }).catch(err => {
                    console.log(err);
                });
            })


    };

//clears the cached token and sets their state to logged out.
    logout = () => {
        this.setState({
            authenticated: false,
            user: {
                role: "visitor"
            },
            accessToken: ""
        });
        this.msalInstance.clearCache();
        //this.msalInstance.logout(); - this will fully log them out of their microsoft account if you're using localstorage for SSO.
    };

//used when the callback recieves a token and return information
    handleAuthentication = (hash) => {
        console.log('handling auth?')
        console.log(this.msalInstance.deserializeHash(hash))
    };

//this is the method that actually attaches the user data to the Auth component for reuse, and sets the bearer token for our api., 
    setSession(idToken) {
        //console.log(idToken)

        let roles = [];
        if (idToken.claims.roles) {
            roles = idToken.claims.roles;
        }
        const user = {
            id: idToken,
            name: idToken.claims.name,
            roles: roles
        };
        this.setState({
            authenticated: true,
            idToken: idToken.rawIdToken,//this is the raw token that you want to pass to as your Bearer token.
            user: user
        });

    }

    render() {
        const authProviderValue = {
            ...this.state,
            initiateLogin: this.initiateLogin,
            handleAuthentication: this.handleAuthentication,
            logout: this.logout
        };
        return (
            <AuthProvider value={authProviderValue}>
                {this.props.children}
            </AuthProvider>
        );
    }
}

export default Auth;
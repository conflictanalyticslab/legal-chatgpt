const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

//getSigningKey is an asynchronous function that uses callbacks, this just turns it into a promise.
//it's probably unnessecary but I'm more comfortable with promises and they let us use async/await.
function getSigningKeyPromise(kid, client) {
    return new Promise((resolve, reject) => {
        try {
            client.getSigningKey(kid, (err, key) => {
                try {
                    if (err) {
                        reject(err);
                    }
                    const signingKey = key.publicKey || key.rsaPublicKey;
                    resolve(signingKey);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
}

//this function will actually check the JWT idToken to see if it's valid,
module.exports = async (idToken) => {
    let decodedAndVerified = null;

    //first decode the jwt
    let parsed = jwt.decode(idToken, { complete: true });

    //get the unique id of the signing key
    let kid = parsed.header.kid;

    //the signing key will be stored in a Json Web Key Set (basically just a list of signing keys, this will point our client at Microsot's key set)
    const client = jwksClient({
        strictSsl: true, // Default value
        jwksUri: 'https://login.microsoftonline.com/common/discovery/keys',
        requestHeaders: {}, // Optional
        requestAgentOptions: {} // Optional
    });

    //this will reach out and try to get the signing key from the key set based on the unique id
    let signingKey = await getSigningKeyPromise(kid, client);

    //once found it will verify the token with that signing key
    decodedAndVerified = jwt.verify(idToken, signingKey);
    if (!decodedAndVerified) {
        throw Error("verification returned null");
    }

    //if everything passes this is where you should verify that it was issued by the expected tenant id / client id / application by checking the claims and comparing them to your Azure AD App Registration. At this point it's still possible that the token was created by a different Azure AD tenant, we've technically just verified that it was signed by microsoft and everything inside is true, we don't yet know that it was issued by our authentication application specifically. But there will be a claim inside the token that indicates the ids of the tenant / app registration that we can double check.

    //if everything has gone to plan, our JWT is valid and we can safely return the decoded version.
    return decodedAndVerified;
}
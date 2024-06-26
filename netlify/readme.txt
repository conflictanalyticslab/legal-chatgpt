The functions directory contains the handlers for saving and updating conversation data in firestore database, all handler functions that wish to be
deployed on Netlify will need to be placed in the functions directory.

In order to check what functions are deployed in the production server, go onto netlify, go to the deploy tab on the left, click on the deployment 
you wish to check, under deployment summary, it will list out the number of functions deployed, and a link that says "visit your functoins" which
has the function logs and other info about your deployed functions. If you cannot find the function you deployed, make sure they follow the format of
the existing functions under function directory.

NOTE: Do not allow CORS on netlify functions, since netlify functions are hosted on the same server as OJ server, so they should send request to the 
same origin within the server and CORS shouldn't be a problem. CORS acts as a firewall to protect access from outside of the origin, do not enable
CORS unless you absolutely have to.

saveConversation.ts:
Post handler that saves conversation to firestore

updateConversation.ts:
Put handler that updates conversaiton based on the new info provided in request body
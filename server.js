const checkAuth = require('./checkAuth');

module.exports = async (req, res, next) => {
    let decodedAndVerified = null;
    try {
        var auth = req.headers.authorization;//get the Authorization header from the incoming request

        let idToken = auth.substring(7);//removes "Bearer " from the Authorization header
        let result = await checkAuth(idToken); //await the result of our authentication check
        if(!result){
            throw Error("Invalid token.")
        }
        req.userData = result;//assuming no error was thrown and we recieved a token, it should be valid so let's attach it for future middleware
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({//if an error occurred just respond with an unauthorized response.
            message: 'Auth failed'
        })
    }
}
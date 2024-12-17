const { json } = require("express");
const jwt  = require("jsonwebtoken");

require("dotenv").config();
async function validateAdmin (req, res, next) {
   try{
         //check whether the token exists or not 
    let token = req.cookies.token
    if(!token){
        return res.send("you must be logged in");
    }
    //next line will run only when the token is present means admin is already logged in
    let data = await jwt.verify(token, process.env.JWT_KEY)
    req.user = data;
    next(); //if everything is fine then move to next middleware or route
   }catch(err){
        res.send(err.message);

        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
          return res.status(401).send("Invalid or expired token. Please log in again.");
      }

      // Send generic error message for other issues
      return res.status(500).send("Internal Server Error");
   }
}
//creating a new middleware that ensures that user must be logged in before searching a product
async function userIsLoggedIn(req, res, next) {
    //inbuilt function given by passports
    if(req.isAuthenticated())
        //if true 
    return next();
    // redirecting to login 
    res.redirect("/users/login");
};
module.exports = {validateAdmin, userIsLoggedIn};
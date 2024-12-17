//for writing passport for google oauth
//search passport google oauth 20
//copy code of configur strategy from the website
var GoogleStrategy = require('passport-google-oauth20').Strategy;

const passport = require('passport');
const {userModel} = require("../models/user");
//this module is mainly used for creating user accounts for google by using their unique id and password

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try{
      //firstly finding a user on the bais of its email
      let user = await userModel.findOne({email: profile.emails[0].value}) //emails ka ek array hota h jiske 0th index pr hme email milta h

      //if we dont find any user 
      if(!user) {
        //then creating a new user
       user = new userModel({
          name: profile.displayName,
          email: profile.emails[0].value,
        
        });
         await user.save();//saving the newly created user after that its mandatory to run the the callback function which is cb 
         
      }
      cb(null, user);//when no error comes it is represented by null
    }
    catch(err){
      cb(err, false);//err found and no user being created
    }
  }
  
));

//serialize user is used to save the user or profile data in express session and sessions are used to send the data in the backend to keep the user being logged in the every route it is mandatory to store its a unique data
passport.serializeUser(function(user, cb){
  return cb(null, user._id); //storing the user id here this adds the id in the session
});
//deserialize fetches all the data of the id
passport.deserializeUser(async function(id,cb){
  //function stores what we serialzed previously
   let user = await userModel.findOne({_id:id});
  cb(null,user) //0 err found and id will be attached to every request
});

module.exports = passport;
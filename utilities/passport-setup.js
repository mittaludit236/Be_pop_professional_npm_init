const passport=require("passport");
const GoogleStrategy=require("passport-google-oauth2").Strategy;
const Guser=require("../models/google_user");
require("dotenv").config();
var prof;
var userGd;
passport.serializeUser(function(user,done){
    done(null,user);
});
passport.deserializeUser(function(user,done){
    done(null,user);
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: process.env.URL,
    passReqToCallback: true
},async(req,accessToken,refreshToken,profile,done)=>{
    prof=profile;
    console.log(profile);
    const existingUser = await Guser.findOne({ id: profile.id });

  if (existingUser) {
    userGd=existingUser._id;
    console.log(userGd);
    done(null, existingUser);
  }
  else
  {
  const newUser = new Guser({
    Name: profile.displayName,
    id: profile.id,
    // Add other user properties as needed
  });
  await newUser.save();
  userGd=newUser._id;
  done(null, newUser);
}
}));
module.exports=userGd;
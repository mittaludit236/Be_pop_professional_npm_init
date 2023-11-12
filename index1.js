const express=require("express");
const { Client } = require("pg");
const app=express();
var vld=false;
var isV=false;
var userId,nm;
var otp;
var newUserD;
const mongoose=require("mongoose");
const saltRounds=process.env.SALT;
const session=require("express-session");
// app.use(express.json());
const bodyParser = require("body-parser");
const passport=require("passport");
require("dotenv").config();
const ejs = require("ejs");
const User=require("./models/User");
const bcrypt=require("bcrypt");
const {getToken}=require("./utilities/help");
// const authR=require("./routes/auth");
app.set('view engine', 'ejs');
const nodemailer=require("nodemailer");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var ema,token;
const crypto=require("crypto");
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000 // 1 hour in milliseconds
  }
})); //making a session for sign in through express-session
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { //user details from which mail to be sent
    user: 'initnpm446@gmail.com',
    pass: process.env.NODE_M_PWD
  }
});
const dbConfig = {
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_database,
  password: process.env.db_pwd,
  port: process.env.db_port,
};
mongoose.connect("mongodb+srv://mittal_udit:"+process.env.MONGO_PASS+"@bepop.qdakrai.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((x)=>{
    console.log("Connected to Mongo");
}).catch((err)=>{
    console.log("error occured while mongo");
    console.log(err);
});
const ExtractJwt=require("passport-jwt").ExtractJwt;
const JwtStrategy=require("passport-jwt").Strategy;
let opts={};
opts.jwtFromRequest=ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey="thisIsSupposedTobeSecret";
passport.use( new JwtStrategy(opts,function(jwt_payload,done){
    User.findOne({_id: jwt_payload.identifier},function(err,user){
        if(err)
        done(err,false);
        if(user)
        done(null,true);
        else
        done(null,false);
    });
}));
function requireAuthenticate(req,res,next){
  if(req.session && req.session.userId)
  next();
  else
  {
  res.redirect("/sign_in");
  }
}
app.get("/",(req,res)=>{
    res.render("home_pg");
});
app.get("/sign_up",(req,res)=>{
    isV=false;
    res.render("signup");
});
app.post("/sign_up", async(req,res)=>{
  if(!isV)
  {
    console.log("hello");
    console.log(req.body);
    const {Name,email,password}=req.body;
    if(!Name || !email || !password)
    return res.status(400).json({err: "Invalid request"});
    const user=await User.findOne({email: email});
    if(user)
    return res.status(402).json({err: "A user with this email already exists"});
    const hashed=await bcrypt.hash(password,10);
    newUserD={Name,password: hashed,email};
    // const newUser=await User.create(newUserD);
    // const token=await getToken(email,newUser);
    // const uReturn={...newUser.toJSON(),token};
    // delete uReturn.password;
    // return res.redirect("/sign_in");
    //mailing system left
    otp=Math.floor(1000 + Math.random() * 9000);
    const mailOptions = { //mail sending
      from: 'initnpm446@gmail.com',
      to: newUserD.email,
      subject: 'OTP Verification',
      html: `<p>Your OTP is: ${otp}</p><p style="color:red;">Do not share your OTP</p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    isV=true;
}
else
{
   const {Otp}=req.body;
   console.log(Otp);
   if(otp==Otp)
   {
    delete otp;
    const newUser=await User.create(newUserD);
    const token=await getToken(newUser.email,newUser);
    const uReturn={...newUser.toJSON(),token};
    delete uReturn.password;
    return res.redirect("/sign_in");
   }
   else
   {
   res.redirect("/sign_up?error=incorrect-otp");
   }
}
});
app.get("/sign_in",(req,res)=>{
  res.render("sign_in");
});
// app.use("/auth",authR);
app.post("/",async(req,res)=>{
    console.log("hellonnn");
    const {email,password}=req.body;
    console.log(req.body);
    if(!email || !password)
    return res.status(401).json({err: "Invalid username or password"});
    const user=await User.findOne({email: email});
    console.log(user);
    if(!user)
    return res.status(401).json({err: "Invalid username or password"});
    const isValid=await bcrypt.compare(password,user.password);
    if(!isValid)
    return res.status(401).json({err: "Invalid username or password"});
    userId=user._id;
    req.session.userId=user._id;
    console.log(userId);
    nm=user.Name;
    const token=await getToken(email,user);
    const uReturn={...user.toJSON(),token};
    delete uReturn.password;
    res.redirect("/profile_pg");
});
app.post("/sign_in",async(req,res)=>{
  console.log("hellonnn");
    const {email,password}=req.body;
    console.log(req.body);
    if(!email || !password)
    return res.status(401).json({err: "Invalid username or password"});
    const user=await User.findOne({email: email});
    console.log(user);
    if(!user)
    return res.status(401).json({err: "Invalid username or password"});
    const isValid=await bcrypt.compare(password,user.password);
    if(!isValid)
    return res.status(401).json({err: "Invalid username or password"});
    userId=user._id;
    req.session.userId=user._id;
    console.log(userId);
    nm=user.Name;
    const token=await getToken(email,user);
    const uReturn={...user.toJSON(),token};
    delete uReturn.password;
    res.redirect("/profile_pg");
});
app.get("/forget",(req,res)=>{
    res.render("forget");
});
app.get("/profile_pg",requireAuthenticate,(req,res)=>{
  res.render("profile_pg");
});
app.post("/forget",async(req,res)=>{
    vld=false;
    ema=req.body.email;
    console.log(ema);
    const user=await User.findOne({ email: ema });
        if (!user) {
          res.status(404).send('User not found');
        } else { 
          token =crypto.randomBytes(20).toString('hex');
          console.log(token);
          user.token=token;
            user.save();
              const mailOptions = { //mail sending
                from: 'initnpm446@gmail.com',
                to: ema,
                subject: 'Reset your Password',
                html: `<p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="http://localhost:3000/reset/${token}">Click on this</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  res.send("Verification email sent!");
                }
              });
        }
});
app.get("/reset/:token",(req,res)=>{
  if(!vld)
  res.render("reset_password");
  else
  res.send("Invalid Link");
});
app.post("/reset/:token",async(req,res)=>{
    const password = req.body.password;
    const user=await User.findOne({email: ema});
    console.log(user.email);
    if (!user) {
        res.status(404).send('Invalid Link');
      } else {
        console.log(user.email);
        bcrypt.hash(password,saltRounds,async(err,hash)=>{
          const hf=await User.updateMany({ email: ema }, { password: hash}); 
          vld=true;
          res.send("Password succesfully changed!!");
        });
        
}
});

app.post("/search",async(req,res)=>{
  const find_prof = req.body.find_prof;

  try {
    if (find_prof === '') {
      res.send([]);
    } else {
      // Using regular expression for case-insensitive search
      const profiles = await Profile.find({ name: { $regex: new RegExp(find_prof, 'i') } });
      res.send(profiles);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.listen(3000,()=>{
    console.log("Server started on port 3000");
});
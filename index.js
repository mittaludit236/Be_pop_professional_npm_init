const express=require("express");
const app=express();
var vld=false;
const mongoose=require("mongoose");
const saltRounds=process.env.SALT;
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
app.get("/",(req,res)=>{
    res.render("home_pg");
});
app.get("/sign_up",(req,res)=>{
    res.render("signup");
});
app.post("/sign_up", async(req,res)=>{
    console.log("hello");
    console.log(req.body);
    const {Name,email,password}=req.body;
    if(!Name || !email || !password)
    return res.status(400).json({err: "Invalid request"});
    const user=await User.findOne({email: email});
    if(user)
    return res.status(402).json({err: "A user with this email already exists"});
    const hashed=await bcrypt.hash(password,10);
    const newUserD={Name,password: hashed,email};
    const newUser=await User.create(newUserD);
    const token=await getToken(email,newUser);
    const uReturn={...newUser.toJSON(),token};
    delete uReturn.password;
    return res.status(200).json(uReturn);
});
// app.use("/auth",authR);
app.post("/",async(req,res)=>{
    console.log("hellonnn");
    const {email,password}=req.body;
    if(!email || !password)
    return res.status(401).json({err: "Invalid username or password"});
    const user=await User.findOne({email: email});
    if(!user)
    return res.status(401).json({err: "Invalid username or password"});
    const isValid=bcrypt.compare(password,user.password);
    if(!isValid)
    return res.status(401).json({err: "Invalid username or password"});
    const token=await getToken(email,user);
    const uReturn={...user.toJSON(),token};
    delete uReturn.password;
    return res.status(200).json(uReturn);
});
app.get("/forget",(req,res)=>{
    res.render("forget");
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
              const mailOptions = { //mail sending
                from: 'initnpm446@gmail.com',
                to: ema,
                subject: 'Test email',
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
    res.render("reset_password");
});
app.post("/reset/:token",async(req,res)=>{
    if(!vld)
    {
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
    }
else
res.send("Invalid Link");
});
app.listen(3000,()=>{
    console.log("Server started on port 3000");
});
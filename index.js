const express=require("express");
const app=express();
var vld=false;
var isV=false;
const multer = require('multer');
var userId,nm;
const fs = require('fs');
const path = require('path');
const ExperienceSchema = require('./models/Experience').schema;
var otp;
var newUserD;
const mongoose=require("mongoose");
const saltRounds=process.env.SALT;
const session=require("express-session");
// app.use(express.json());
const bodyParser = require("body-parser");
const passport=require("passport");
// require("./utilities/passport-setup");
var userGd=require("./utilities/passport-setup");
app.use(passport.initialize());
// app.use(passport.session());
require("dotenv").config();
const ejs = require("ejs");
const User=require("./models/User");
const Guser=require("./models/google_user");
const bcrypt=require("bcrypt");
const {getToken}=require("./utilities/help");
// const authR=require("./routes/auth");
app.set('view engine', 'ejs');
// const prof=require("./utilities/passport-setup");
const nodemailer=require("nodemailer");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/profile_pg",express.static("public"));
app.use("/set",express.static("public"));
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
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
      cb(null,file.originalname);
  },
});
const upload = multer({ storage: storage });
const multipleUploads = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
  { name: 'profileBanner', maxCount: 1 },
  // Add more fields as needed
]);
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
   console.log(otp);
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
    const ud=userId.toString();
    req.session.userId=user._id;
    console.log(userId);
    nm=user.Name;
    const token=await getToken(email,user);
    const uReturn={...user.toJSON(),token};
    delete uReturn.password;
    const purl="/profile_pg/"+ud;
    res.redirect(purl);
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
    const ud=userId.toString();
    req.session.userId=user._id;
    console.log(user._id.toString());
    nm=user.Name;
    const token=await getToken(email,user);
    const uReturn={...user.toJSON(),token};
    delete uReturn.password;
    const purl="/profile_pg/"+ud;
    res.redirect(purl);
});
app.get("/forget",(req,res)=>{
    res.render("forget");
});
app.get("/profile_pg/:id",requireAuthenticate,async(req,res)=>{
  var uer=await User.findOne({_id: req.params.id});
  if(!uer)
  uer=await Guser.findOne({_id: req.params.id});
  if(uer.Banner.size!=0 && uer.Profile.size!=0)
  res.render("profile_pg",{name: uer.Name, skills: uer.skills,exp: uer.experiences,edu: uer.Education,email: uer.email,city: uer.Location,intro: uer.Intro,ud: req.params.id,nm: uer.Profile[0].name,bnm: uer.Banner[0].name});
  else if(uer.Banner.size!=0)
  res.render("profile_pg",{name: uer.Name, skills: uer.skills,exp: uer.experiences,edu: uer.Education,email: uer.email,city: uer.Location,intro: uer.Intro,ud: req.params.id,nm: "01.jpg",bnm: uer.Banner[0].name});
  else if(uer.Profile.size!=0)
  res.render("profile_pg",{name: uer.Name, skills: uer.skills,exp: uer.experiences,edu: uer.Education,email: uer.email,city: uer.Location,intro: uer.Intro,ud: req.params.id,nm:uer.Profile[0].name,bnm: "01.jpg"});
  else
  res.render("profile_pg",{name: uer.Name, skills: uer.skills,exp: uer.experiences,edu: uer.Education,email: uer.email,city: uer.Location,intro: uer.Intro,ud: req.params.id,nm: "01.jpg",bnm: "01.jpg"});
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
app.get("/logout",requireAuthenticate,(req,res)=>{
  req.session.destroy((err)=>{
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.redirect("/");
  })
});
app.get("/failure",(req,res)=>{
  res.send("Failed to log in");
});
app.get("/google",passport.authenticate("google",{scope:["profile","email"]}));
app.get("/google/callback",passport.authenticate("google",{failureRedirect: "/failure"}),(req,res)=>{
  // console.log(prof);
  const tok=crypto.randomBytes(20).toString('hex');
  req.session.userId=tok;
  const purl="/profile_pg/"+req.user._id.toString();
  res.redirect(purl);
});
app.post("/search",async(req,res)=>{
  const find_prof = req.body.find_prof;
  console.log(find_prof);
  try {
    if (find_prof === '') {
      res.send([]);
    } else {
      // Using regular expression for case-insensitive search
      const profiles = await User.find({ Name: { $regex: new RegExp(find_prof, 'i') } });
      console.log("hello");
      const pr=await Guser.find({ Name: { $regex: new RegExp(find_prof, 'i') } });
      console.log(pr);
      console.log(profiles);
      if(profiles.length==0)
      res.send(pr);
      else
      res.send(profiles);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/set/:id",requireAuthenticate,async(req,res)=>{
  var uer=await User.findOne({_id: req.params.id});
  if(!uer)
  uer=await GUser.findOne({_id: req.params.id})
  console.log(req.params.id);
  if(uer.Banner.size!=0 && uer.Profile.size!=0)
  res.render("candidate-profile",{ud: req.params.id,nm: uer.Profile[0].name,bnm: uer.Banner[0].name});
  else if(uer.Banner.size!=0)
  res.render("candidate-profile",{ud: req.params.id,nm: "01.jpg",bnm: uer.Banner[0].name});
  else if(uer.Profile.size!=0)
  res.render("candidate-profile",{ud: req.params.id,nm:uer.Profile[0].name,bnm: "01.jpg"});
  else
  res.render("candidate-profile",{ud: req.params.id,nm: "01.jpg",bnm: "01.jpg"});
});
app.post("/set/:id",multipleUploads,async(req,res)=>{
  const p1="/set/"+req.params.id;
  const p2="/profile_pg/"+req.params.id;
  var uer=await User.findOne({_id: req.params.id});
  if(!uer)
  uer=await Guser.findOne({_id: req.params.id});
  console.log(uer);
  if(req.body.skill)
  {
    const newSkill={
      skillName: req.body.skill,
    };
    uer.skills.push(newSkill);
    uer.save();
    res.redirect(p1);
    
  }
  else if(req.body.nm)
  {
    const newExperience ={
      companyName: req.body.nm,
      position: req.body.title,
      startDate: req.body.start,
      endDate: req.body.end,
  };
  uer.experiences.push(newExperience);
  uer.save();
  res.redirect(p1);
  }
  else if(req.body.cName)
  {
    const newEdu={
    CollegeName: req.body.cName,
    Degree: req.body.degree,
    startYear: req.body.sy,
    endYear: req.body.ey,
    };
    uer.Education.push(newEdu);
    uer.save();
    res.redirect(p1);
  }
  else if(req.body.fname)
  {
    uer.Name=req.body.fname+" "+req.body.lname;
    uer.email=req.body.email;
    uer.Location=req.body.location;
    uer.Occupation=req.body.occupation;
    uer.Intro=req.body.intro;
    const { originalname, buffer, mimetype } = req.files["file"][0];
    const file ={
      name: originalname,
      iname: "resume_"+req.params.id,
      data: buffer,
      contentType: mimetype
    };
    if(uer.Files.size==0)
    uer.Files.push(file);
    else
    uer.Files[0]=file;
    uer.save();
    res.redirect(p2);
  }
  else if(req.files["profileImage"])
  {
    const x=req.files["profileImage"][0];
    const pr={
      name: x.originalname,
      iname: "profile_"+req.params.id,
      data: x.buffer,
      contentType: x.mimetype,
    };
    if(uer.Profile.size==0)
    uer.Profile.push(pr);
    else
    uer.Profile[0]=pr;
    uer.save();
    res.redirect(p2);
  }
  else if(req.files["profileBanner"])
  {
    const x=req.files["profileBanner"][0];
    const pr={
      name: x.originalname,
      iname: "banner_"+req.params.id,
      data: x.buffer,
      contentType: x.mimetype,
    };
    if(uer.Banner.size==0)
    uer.Banner.push(pr);
    else
    uer.Banner[0]=pr;
    uer.save();
    res.redirect(p2);
  }

// Create an experience object using the ExperienceSchema
});
app.get('/view/:id', async (req, res) => {
  try {
    const profile = await User.findOne({_id: req.params.id});
   
    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    const fileName = profile.Files[0].name;
    const filePath = path.join(__dirname, 'public', 'uploads', fileName);

    const fileStream = fs.createReadStream(filePath);

    // Set appropriate headers for the response
    res.setHeader('Content-Type', profile.Files[0].contentType); // Adjust the content type based on your file type
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);

    // Return the file as a response
    fileStream.pipe(res);
} catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
}
});
app.listen(3000,()=>{
    console.log("Server started on port 3000");
});
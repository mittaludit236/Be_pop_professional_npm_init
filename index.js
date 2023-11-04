const express=require("express");
const app=express();
const mongoose=require("mongoose");
app.use(express.json());
const passport=require("passport");
require("dotenv").config();
const authR=require("./routes/auth");
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
    res.send("its working!");
});
app.use("/auth",authR);
app.listen(3000,()=>{
    console.log("Server started on port 3000");
});
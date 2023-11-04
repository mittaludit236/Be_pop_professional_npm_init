const express=require("express");
const route=express.Router();
const User=require("../models/User");
const bcrypt=require("bcrypt");
const {getToken}=require("../utilities/help");
route.post("/sign_up", async(req,res)=>{
    const {firstName,lastName,email,password}=req.body;
    if(!firstName || !lastName || !email || !password)
    return res.status(400).json({err: "Invalid request"});
    const user=await User.findOne({email: email});
    if(user)
    return res.status(402).json({err: "A user with this email already exists"});
    const hashed=await bcrypt.hash(password,10);
    const newUserD={firstName,lastName,password: hashed,email};
    const newUser=await User.create(newUserD);
    const token=await getToken(email,newUser);
    const uReturn={...newUser.toJSON(),token};
    delete uReturn.password;
    return res.status(200).json(uReturn);
});
route.post("/sign_in",async(req,res)=>{
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
module.exports=route;

const mongoose=require("mongoose");
const Experience=require("./Experience").schema;
const Skill=require("./Skills").schema;
const Education=require("./Education").schema;
const File=require("./File").schema;
const profile=require("./profile").schema;
const banner=require("./banner").schema;
const UserSchema=new mongoose.Schema({
    Name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    Occupation:{
        type: String,
    },
    password:{
        type: String,
        required: true,
    },
    experiences: [ Experience ],
    projects: [
        {
            type: String,
        },
    ],
    skills: [ Skill ],
    Education: [ Education ],
    Location: {
        type: String,
    },
    Intro: {
        type: String,
    },
    Files: [ File ],
    Profile: [ profile ],
    Banner : [ banner ],
});
const User=mongoose.model("User",UserSchema);
module.exports=User;
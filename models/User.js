const mongoose=require("mongoose");
const UserSchema=new mongoose.Schema({
    Name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    experiences: [
        {
            type: String,
        },
    ],
    projects: [
        {
            type: String,
        },
    ],
    skills: [
        {
            type: String,
        },
    ]
});
const User=mongoose.model("User",UserSchema);
module.exports=User;
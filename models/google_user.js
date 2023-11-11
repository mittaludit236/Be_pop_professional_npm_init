const mongoose=require("mongoose");
const GSchema=new mongoose.Schema({
    Name:{
        type: String,
        required: true,
    },
    id:{
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
const Guser=mongoose.model("Guser",GSchema);
module.exports=Guser;
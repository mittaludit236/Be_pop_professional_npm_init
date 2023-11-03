const mongoose=require("mongoose");
const SkillSchema=new mongoose.Schema({
    skillName: {
        type: String,
        required: false,
    },
});
const Skill=mongoose.model("Skill",SkillSchema)
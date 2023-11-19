const mongoose=require("mongoose");
const EducationSchema=new mongoose.Schema({
    CollegeName: {
        type: String,
        required: true,
    },
    Degree: {
        type: String,
        required: true,
    },
    startYear: { 
        type: Number,
        required: false,
    },
    endYear: {
        type: Number,
        required: false,
    },
});
const Education=mongoose.model("Education",EducationSchema);
module.exports=Education;

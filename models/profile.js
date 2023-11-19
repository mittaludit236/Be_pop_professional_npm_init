const mongoose=require("mongoose");
const ProfileSchema=new mongoose.Schema({
  name: {
    type: String
  },
  iname: {
    type: String
  },
  data: {
    type: Buffer
  },
  contentType: {
    type: String
  },
});
const profile=mongoose.model("Profile",ProfileSchema);
module.exports=profile;
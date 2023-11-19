const mongoose=require("mongoose");
const BannerSchema=new mongoose.Schema({
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
const banner=mongoose.model("Banner",BannerSchema);
module.exports=banner;
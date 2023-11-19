const mongoose=require("mongoose");
const FileSchema=new mongoose.Schema({
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
const File=mongoose.model("File",FileSchema);
module.exports=File;
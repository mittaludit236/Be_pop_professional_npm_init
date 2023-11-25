const mongoose=require("mongoose");
const profile=require("./profile").schema;
const PostSchema=new mongoose.Schema({
    name: {
      type: String
    },
    id: {
      type: String
    },
    date: {
        type: String
    },
    describe: {
      type: String
    },
    image: [ profile ],
});
const post=mongoose.model("Post",PostSchema);
module.exports=post;

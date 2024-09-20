const mongoose = require("mongoose");
const user = require("./user");

// Connect to MongoDB


// Define the schema
const PostSchema = new mongoose.Schema({
  post:String,
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
  },
  model:String,
  condition:String,
  address:String,
  Number:String,
  price:String,
});

// Export the model
module.exports = mongoose.model("post", PostSchema);
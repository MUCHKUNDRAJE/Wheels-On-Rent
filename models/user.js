const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/wheelsonrent");

// Define the schema
const userSchema = new mongoose.Schema({
    username: String,
    name : String,
    email: String,
    password: String,
    phone: String,
    post:
    [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post",
        }
    ],
    porfile:String,
    cart :[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post",
        }
    ]
  
    
});

// Export the model
module.exports = mongoose.model("user", userSchema);



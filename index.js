const express = require("express");
const app = express();
const path = require("path");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const usermodel = require("./models/user");
const postmodel = require("./models/post");
const jwt = require("jsonwebtoken");
const upload = require("./config/multer");
const user = require("./models/user");
const { render } = require("ejs");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookie());


function call(req) {
  return req.cookies.token ? 0 : 1;
}



function isLoggedin(req, res, next) {
  const token = req.cookies.token;

  if (!token || token === " ") {
    return res.redirect("/login");
  }

  try {
    let data = jwt.verify(token, "shhhhh"); 
    req.user = data; 
    next();
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return res.redirect("/login");
  }
}


app.get("/", function (req, res, next) {
  let flag = call(req);
  console.log(flag)
  res.render("index", { flag });
});


app.get("/add", isLoggedin, function (req, res, next) {
  let flag = call(req);
  res.render("add", { flag });
});


app.get("/rent", isLoggedin, async function (req, res, next) {
  let flag = call(req);
  let user = await usermodel.findOne({ email:req.user.username });

  let post = await postmodel.find({}).populate("user");



  res.render("rent", { flag, user, post });
});


app.get("/login", function (req, res, next) {
  res.render("login");
});

app.get("/id", function (req, res, next) {
  res.render("register");
});


app.post("/register", async (req, res, next) => {
  let { username, name, email, phone, password } = req.body;

  let user = await usermodel.findOne({ email });
  if (user) return res.status(400).send("You are already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let newUser = await usermodel.create({
        username,
        name,
        email,
        phone,
        password: hash,
      });
      let token = jwt.sign({ username: email, userId: newUser._id }, "shhhhh");
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});


app.post("/login", async (req, res, next) => {
  let { email, password } = req.body;

  let user = await usermodel.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ username: email, userId: user._id }, "shhhhh");
      res.cookie("token", token);
      res.redirect("/");
    } else {
      res.redirect("/login?error=incorrect-password");
    }
  });
});


app.get("/logout", (req, res, next) => {
  res.cookie("token", " ");
  res.redirect("/login");
});

app.post("/add", isLoggedin, upload.single("photo"), async (req, res, next) => {
  try {

    let user = await usermodel.findOne({ email: req.user.username }); 
    if (!user) {
      return res.status(404).send("User not found");
    }

 
   

  
    let photo = req.file.filename;
    let { name, condition, price, phone, address } = req.body;


    let post = await postmodel.create({
      user: user._id,
      post: photo,
      model: name,
      condition: condition,
      Number: phone,
      address: address,
      price: price,
    });

 
    user.post.push(post._id);
    await user.save();


    res.redirect("/porfile");
  } catch (error) {
    console.error("Error in /add route:", error);
    next(error); 
  }
});


app.get("/porfile" , isLoggedin ,async (req,res,next)=>{
  let user = await usermodel.findOne({email :req.user.username}).populate("post");
  flag = call(req);
  res.render("porfile",{flag ,user} );
})

app.post("/por-img", isLoggedin, upload.single("img"), async (req, res, next) => {
  try {
    let user = await usermodel.findOne({ email: req.user.username });
    if (!user) return res.status(404).send("User not found");

    if (!req.file) return res.status(400).send("No file uploaded");

    let img = req.file.filename;
    user.porfile = img;
    await user.save();

    res.redirect("/porfile");
  } catch (error) {
    console.error("Error in /por-img route:", error);
    next(error);
  }
});

app.get("/details/:id", isLoggedin , async(req,res,next)=>
{
 let user = await postmodel.findOne({_id:req.params.id}).populate("user");

let flag = call(req)
 res.render("show",{ flag , user});

})

app.post("/view" , isLoggedin ,async (req,res,next) =>{
  
   let postid = req.body.id;
   let  user = await usermodel.findOne({email:req.user.username});
   user.cart.push(postid);
   await user.save();

   res.redirect("/view/id");

})

app.get("/view/id", isLoggedin, async (req, res, next) => {
  try {
    // Find the user by their email and populate their cart
    let user = await usermodel
      .findOne({ email: req.user.username })
      .populate({
        path: "cart",     
        populate: {        
          path: "user",     
          model: "user",    
        }
      });



    let flag = call(req); // Assuming call(req) is a function you defined

    // Render the view template with the populated user and flag
    res.render("view", { flag, user });
  } catch (error) {
    console.error("Error populating cart with user:", error);
    next(error); // Pass the error to the next middleware
  }
});







app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

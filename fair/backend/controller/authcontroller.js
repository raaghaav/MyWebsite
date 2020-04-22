const userModel = require("../model/userModel");
const Email = require("../utility/email");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../configs/config");  // {} particular key nikalne ke liye

async function signup(req, res) {
  try {
    const user = await userModel.create(req.body);
    res.status(201).json({
      status: "user signed up",
      user
    })
  } catch (err) {
    res.status(400).json({ err })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password"); // login ke liye pass jaruri hota hai therefore used select 
    // console.log(user);
    if (user) {
      if (password == user.password) {
        // jwt
        const { _id } = user;   // users main se _id nikal rahe hai "_id" user ki id hai jo predefined hai 
        const token = jwt.sign({ id: _id }, JWT_SECRET, {  // giving "_id" as payload to jwt [.sign => is signature establishing from payload deafault also and secret key ]
          expiresIn: Date.now() + 1000 * 60 * 30   // date.now => present + 30 min == token gets expired in 30 min from generation
        })
        res.status(200).json({
          status: "successfull",
          user,
          token   // yeh token yahan se aage client ko bhej diya 
        })
      } else {
        throw new Error("user or password didn't match")
      }
    } else {
      throw new Error("user or password didn't match ");
    }
  } catch (err) {
    console.log(err);
    res.json({
      err
    })
  }
}
// authenticate => user
async function protectRoute(req, res, next) {     // client ko verify karega 
  try {
    // headers 
    if (req.headers && req.headers.authorization) {     //  "authorization" key req.headers main hoti hai, => req.headers main authorization key se token nikal rahe hai 
      const token = req.headers.authorization.split(" ").pop();  // token req.headers.authrization main aa jayega from bearer token
      // console.log(token)

      if (token) {
        const decryptedData = jwt.verify(token, JWT_SECRET);
        if (decryptedData) { // decryptedData is true when user jwt is verified (decryptedData  matlab verify karna  )
          const id = decryptedData.id; // we sent _id to token in login fn so we take out that _id 
          console.log(id);
          // console.log(decryptedData) 
          req.id = id; // req par ek nayi key add kar di i.e. "id" [req.id] aur usme[req.id], decryptedData.id = const id ,  yeh id de di, now all other M.W fn can use that req.id
          next();
        } else {
          throw new Error("Invalid Token");
        }
      } else {
        throw new Error("Please login again to access this route ");
      }
    } else {
      throw new Error("Please provide a token");
    }

  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status: "unsuccessfull",
      err
    })
  }
}
// authorization
async function isAdmin(req, res, next) { 
  try {
    const user = await userModel.findById(req.id); // user ko find kar lunga isse 
    if (user) {
      if (user.role == "admin") {
        next()
      } else {
        throw new Error("User not authorized");
      }
    } else {
      throw new Error("User not found");
    }
  } catch (err) {
    res.status(400).json({ err: err });
  }
}

function isAuthorized(roles) {     //  isAuthorized main saare roles aa rahe hai
  return async function (req, res, next) { // yahan se fn return kar diya in planRouter for isAuthorized
    try {
      const { id } = req;  // req se "id" aa jayegi  
      const user = await userModel.findById(id); // user ko find kar lunga isse 
      console.log(user);
      const { role } = user;  // taking out "roles"
      if (roles.includes(role) == true) { // checking roles => jo current role hai issme wo planRouter main tha, if true => next()
        next()
      } else {
        throw new Error("You are not authorized ");
      }
    } catch (err) {
      console.log(err);
      res.status(403).json(
        { err }
      )
    }
  };
}

async function forgetPassword(req, res) {
  try {
    const { email } = req.body;  // req.body se email nikala
    const user = await userModel.findOne({ email: email }); // findOne takes input in key-value form 
    
    if (user) {
      // console.log(user);
      const token = user.createToken();   // this.resetToken & this.expiresIn fns from userModel also get attached to this user  
      
      // db => save  // db main save karna hai therefore await and .save  
      await user.save({ validateBeforeSave: false });  // validateBeforeSave- prevents validators to execute OR no validation will work
      // email 
      const resetPasswordLink = `http://localhost:3000/api/users/resetPassword/${token}`   // iss route par req. lagaenge

      const emailOptions = {}; // apne options banane padenge mail bhejne ke liye
      emailOptions.html = `<h1>Please click on the link to reset your password </h1>
      <p>${resetPasswordLink}</p>` ;
      emailOptions.to = email; // this "email" is the one which came in req.body on /forgetPassword route
      emailOptions.from = "customersupport@everyone.com"; // it is just a placeholder, actual email comes from email.js file
      emailOptions.subject = "Reset Password Link"
      await Email(emailOptions);  // yahan se emailOptions call ho jayega =>email.js => transport etc. 

      res.status(200).json({
        resetPasswordLink,   //  sending this resetPasswordLink in response
        status: `Email send to ${email}`
      })
    } else {
      throw new Error("You does not exist");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err
    })
  }
}
async function resetPassword(req, res) {
  try {
    const token = req.params.token; // req.params main token aaya in form of link => usse const token main daal diya  
    const user = await userModel.findOne({ resetToken: token });  // findOne takes input in key-value form 
    if (user) {
      if (Date.now() < user.expiresIn) {
        const { password, confirmPassword } = req.body; // taking out pass & confirmPass from req.body
        
        user.resetPasswordhelper(password, confirmPassword);
        await user.save();    // db main save karna hai therefore await and .save  
        res.status(200).json({
          success: "user password updated login with new password"
        })
      } else {
        throw new Error("token has expired");
      }
    } else {
      throw new Error("user not found");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err
    })
  }
  // resetPassword/svmbamvbd
  // db => svmbamvbd=> user search => user
  // user => password
}
module.exports.signup = signup;
module.exports.login = login;
module.exports.protectRoute = protectRoute;
module.exports.isAdmin = isAdmin;
module.exports.isAuthorized = isAuthorized;
module.exports.forgetPassword = forgetPassword;
module.exports.resetPassword = resetPassword;



// login
// user verify
// protect Route 
// authorization

//forgetPassword
//resetPassword
//updatepassword
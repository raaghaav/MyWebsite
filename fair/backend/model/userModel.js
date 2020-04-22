const mongoose = require("mongoose");      // mongoose => promise based library
const cryto = require("crypto");

// connection
const config = require("../configs/config");
mongoose
  .connect(config.DB_LINK, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(function (db) {
    // console.log(db);
    console.log("userDB connected");
  })
  .catch(function (err) {
    console.log(err);
  });

// sch
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 7,
    required: true,
    select: false, // all above keys are required but password nahi aayega b/c select : false 
  },
  confirmPassword: {
    type: String,
    minlength: 7,
    validate: function () {
      return this.password == this.confirmPassword;
    },
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "owner"],
    default: "user",
  },
  
  resetToken: String,     // added these 2 keys b/c for every user this will be used
  resetTokenExpires: Date
});

// hooks
userSchema.pre("save", function () {
  // db => confirmpassword
  this.confirmPassword = undefined;
});



userSchema.methods.createToken = function () {          // this method will be attached to every user
  const token = crypto.randomBytes(32).toString("hex");   // token generate kiya 
  // user
  this.resetToken = token   // since this points to current document  & token ko user ke andar save kar diya 
  this.expiresIn = Date.now() + 10 * 1000 * 60;
  // 
  return token; // jis email se req aayi thi uss par bhej diya   
}


userSchema.methods.resetPasswordhelper = function (password, confirmPassword) {
  this.password = password;  // updating pass of current user 
  this.confirmPassword = confirmPassword; // updating ConfirmPass of current user  
  this.resetToken = undefined;    // now after updating we don't require resetToken 
  this.expiresIn = undefined;     // // now after updating we don't require expiresIn 
}


const userModel = mongoose.model("NewUserModel", userSchema);

module.exports = userModel;
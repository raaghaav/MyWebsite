const mongoose = require("mongoose");      // mongoose => promise based library
const cryto = require("crypto");

// connection
const secrets = require("../config/secrets");
mongoose
  .connect(secrets.DB_LINK, {
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
    select: false,
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

  resetToken: String,
  resetTokenExpires: Date

});

// hooks
userSchema.pre("save", function () {
  // db => confirmpassword
  this.confirmPassword = undefined;
});



userSchema.methods.createToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  // user
  this.resetToken = token
  this.expiresIn = Date.now() + 10 * 1000 * 60;
  // 
  return token;
}


userSchema.methods.resetPasswordhelper = function (password, confirmPassword) {
  this.password = password;
  this.confirmPassword = confirmPassword;
  this.resetToken = undefined;
  this.expiresIn = undefined;
}


const userModel = mongoose.model("NewUserModel", userSchema);

module.exports = userModel;
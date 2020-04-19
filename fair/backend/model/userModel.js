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


// I have not included createResetToken  and resetPasswordhandler 


const userModel = mongoose.model("NewUserModel", userSchema);

module.exports = userModel;
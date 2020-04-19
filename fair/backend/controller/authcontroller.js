async function signup(req, res) {
  try {
    const newUser = await userModel.create(req.body);
    //  welcome mail
    res.status(201).json({
      status: "user Signedup",
      newUser,
    });
  } catch (err) {
    res.status(500).json({
      status: "user can't be created",
      err,
    });
  }
}


async function login(req, res) {
  try {
    if (req.body.email && req.body.password) {
      // find user
      const user = await userModel.findOne({ email: req.body.email }).select("+password");
      if (user) {
        // console.log(user);
        if (user.password == req.body.password) {
          const id = user["_id"];
          const token = jwt.sign({ id }, secrets.JWT_SECRET);
          return res.status(200).json({
            status: "userLogged In",
            user,
            token,
          });
        } else {
          throw new Error("email or password didn't match ");
        }
      } else {
        throw new Error("User not found");
      }
    }

    throw new Error("Invalid Input");
  } catch (err) {
    // console.log(err);
    return res.status(500).json({
      status: "user can't be loggedIn",
      err,
    });
  }
}


async function forgetPassword(req, res) {
  let { email } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      // create token
      const resetToken = user.createResetToken();
      // confirm password
      await user.save({ validateBeforeSave: false });
      resetPath = "http://localhost:3000/api/users/resetPassword/" + resetToken;
      // send Mail
      res.status(200).json({
        resetPath,
        resetToken,
        status: "Token send to your email"
      })
    } else {
      throw new Error("User not found");
    }

  } catch (err) {
    console.log(err);
    res.status(400).json({
      err,
      status: "cannot reset password"
    }
    )
  }

}

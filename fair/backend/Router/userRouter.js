const express = require("express")
const userRouter = express.Router();
const { getAllUsers, createUser } = require("../controller/userController");
const { getMe } = require("../controller/userController");
const { signup, login, protectRoute, isAuthorized, forgetPassword, resetPassword } = require("../controller/authController");
// signup
userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.get("/profilePage", protectRoute, getMe); // get ki req aa rahi hai "getMe" route par & protectroute => user loggedIn ho
userRouter.patch("/forgetPassword", forgetPassword)
userRouter.patch("/resetPassword/:tokeplan", resetPassword);
// login 
// forgetPassword
//resetPassword
// userRouter
//   .route("/:userId")
//   .patch(updateUser)
//   .delete(removeUser)
//   .get(getUser);
// admin
userRouter.use(protectRoute, isAuthorized(["admin"])); //  isAuthorized role check karega & role user main hoga, "id" ko identify karke wo role nikal kar de dega 
userRouter.route("").
  get(getAllUsers)
  .post(createUser);
module.exports = userRouter;
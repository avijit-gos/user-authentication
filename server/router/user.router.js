const router = require("express").Router();
const { signUp, signIn, forgetPassword, resetPassword, getUser } = require("../controller/user.controller");
const auth = require("../Authenticatioon/auth")

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgetpassword", forgetPassword);
router.put("/resetpassword", resetPassword);
router.post("/userinfo", auth, getUser);

module.exports = router
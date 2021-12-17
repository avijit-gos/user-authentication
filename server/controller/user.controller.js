const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/user.model");
const cloudinary = require("cloudinary");
const mailgun = require("mailgun-js");
const mg = mailgun({ apiKey: process.env.PRIVATE_API_KEY, domain: process.env.DOMAIN });
const _ = require("lodash");

//cloudinary configuration...
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

class UserController {
  constructor() {
    console.log("UserController initiated");
  }

  /**
   * @SignUp
   */
  signUp(req, res) {
    const file = req.files.profile_img;
    const { name, email, password, gender } = req.body
    //Search User already exists in the DB or not...
    User.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(501).json({ msg: "Server went down" })
      }
      else {
        //If user already find inside the DB...
        if (user !== null) {
          return res.status(401).json({ msg: "Email already being taken" });
        }
        //If the email address is not present inside the DB...
        else {
          //upload user profile picture into the clodinary..
          cloudinary.uploader.upload(file.tempFilePath, (result, err) => {
            //if Image uploading process return err or RESULT return null...
            if (err || result === null) {
              return res.status(401).json({ msg: "Profile picture cannot uploaded" });
            }
            //If everything goes successfully...
            else {
              //console.log(err, result);
              //hash user password..
              bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                  return res.status(401).json({ msg: "Error in Password" });
                }
                //create newUser Object...
                else {
                  const newUser = User({
                    _id: new mongoose.Types.ObjectId,
                    name: name,
                    email: email,
                    password: hash,
                    gender: gender,
                    profile_img: result.url
                  });
                  //save newUser into DB...
                  newUser.save()
                    .then(user => {
                      res.status(201).json({ msg: "Successfully SignUp", user })
                    })
                    .catch(err => {
                      return res.status(401).json({ msg: "User cann't saved into DB" })
                    })
                }
              });
            }
          });
        }
      }
    });
  }

  /**
   * @SignIn
   */
  signIn(req, res) {
    const { email, password } = req.body;
    //Find the User by their Email address...
    User.findOne({ email }, (err, user) => {
      if (err || user === null) {
        return res.status(501).json({ msg: "Server went down" });
      }
      //If user find in the DB...
      else {
        //Compare the password...
        bcrypt.compare(password, user.password, (err, result) => {
          //If password did not match...
          if (err || result === false) {
            return res.status(401).json({ msg: "Email & Password did not matched" });
          }
          //If password matched then generate the JWT token...
          else {
            const token = jwt.sign({
              _id: user._id,
              name: user.name,
              email: user.email
            },
              process.env.SECRET_KEY,
              { expiresIn: "24H" }
            );
            return res.status(201).json({ msg: "Successfull SignIn", token: token });
          }
        })
      }
    });
  }

  /**
   * @Forget_Password
   */
  forgetPassword(req, res) {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
      if (err) {
        return res.status(401).json({ msg: "User not found" });
      }
      else {
        const resetToken = jwt.sign({ _id: user._id }, process.env.PASSWORD_RESET_KEY, { expiresIn: "1h" });
        const data = {
          from: "noreply@test.com",
          to: email,
          subject: "Reset Password link",
          html: `
           <p>Click on the given below link to reset your password. This link is valid for next 1hour.</p>
           <p>${process.env.CLIENT_URL}/resetpassword/${resetToken}</p>
          `
        };
        return User.updateOne({ resetPasswordLink: resetToken }, (err, result) => {
          if (err) {
            return res.status(401).json({ msg: "Reset Password link error" });
          }
          else {
            mg.messages().send(data, (err, body) => {
              if (err) {
                return res.status(401).json({ msg: err.message });
              }
              else {
                return res.status(201).json({ msg: "Email has been send" });
              }
            })
          }
        })
      }
    })
  }

  /**
   * @Reset_Password
   */
  resetPassword(req, res) {
    const { resetPasswordLink, newPass } = req.body;
    User.findOne({ resetPasswordLink }, (err, user) => {
      if (err || user === null) {
        return res.status(401).json({ msg: "Error in reset password link" });
      }
      else {
        bcrypt.hash(newPass, 10, (err, hash) => {
          if (err) {
            return res.status(401).json({ msg: "Error in new password" });
          }
          else {
            const userObj = {
              password: hash,
            }
            user = _.extend(user, userObj);
            user.save()
              .then(result => {
                return res.status(200).json({ msg: "User updated with new password" });
              })
              .catch(err => {
                return res.status(401).json({ msg: err });
              })
          }
        })
      }
    })
  }

  getUser(req, res) {
    const { _id, token } = req.body;
    User.findById(_id, (err, user) => {
      if (err, user === null) {
        res.status(401).json({ msg: "User not found" })
      }
      else {
        res.status(200).json({ user })
      }
    })
  }

}

module.exports = new UserController;
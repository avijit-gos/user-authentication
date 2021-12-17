const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
    unique: true,
    min: 8,
  },
  gender: {
    type: String,
  },
  profile_img: {
    type: String
  },
  resetPasswordLink: {
    data: String,
    default: ""
  }
},
  { timestamps: true },
);
module.exports = mongoose.model("User", UserSchema);
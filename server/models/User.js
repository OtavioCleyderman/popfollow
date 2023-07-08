const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
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
      required: true,
    },
    administrator: {
      type: Boolean,
      default: false,
    },
    socialLogin: {
      type: Boolean,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET);
  this.tokens = token;
  return token;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;

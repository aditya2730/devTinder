const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    lastName: {
      type: String,
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error("invalid email " + val);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(val) {
        if (!validator.isStrongPassword(val)) {
          throw new Error("please enter strong password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender is not valid");
        }
      },
      lowercase: true,
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1UJEOh1vZAa5d790__Jcb0pQQkI6InOqwtQ&s",
      validate(val) {
        if (!validator.isURL(val)) {
          throw new Error("invalid photoUrl");
        }
      },
    },
    bio: {
      type: String,
      default: "Hi, i am on devTinder",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "password");
  return token;
};

userSchema.methods.validatePassword = async function (userInputPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(userInputPassword, passwordHash);
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = { User };

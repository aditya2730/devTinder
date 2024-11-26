const express = require("express");
const { User } = require("../model/user");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../helper/validation");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      password: passwordHash,
      emailId,
    });

    await user.save();
    res.send("user signedUp");
  } catch (error) {
    console.log(error);
    res.status(400).send("Error saving the user: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const isUserPresent = await User.findOne({ emailId: emailId });
    if (!isUserPresent) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await isUserPresent.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }
    const token = await isUserPresent.getJWT();
    res.cookie("token", token).send("login sucessfull");
  } catch (error) {
    console.log(error);
    res.status(400).send("something went wrong: " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("logged out");
});

module.exports = authRouter;

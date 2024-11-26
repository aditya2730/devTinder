const express = require("express");
const userAuth = require("../midllewares/auth");
const {
  validateProfileEditData,
  validateSignUpData,
  validatePassword,
} = require("../helper/validation");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(401).send("Unauthorized request");
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid edit request");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((ele) => {
      loggedInUser[ele] = req.body[ele];
    });
    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName}'s profile edited successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

profileRouter.patch("/profile/change/password", userAuth, async (req, res) => {
  try {
    if (!validatePassword(req)) {
      throw new Error("Please enter a strong new password");
    }
    const currentPasswordValid = await bcrypt.compare(
      req.body.password,
      req.user.password
    );
    if (!currentPasswordValid) {
      throw new Error("Incorrect current password");
    }
    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    req.user.password = passwordHash;
    await req.user.save();
    res.json({ message: `password changed successfully` });
  } catch (error) {
    res.status(400).json({ message: `${error.message}` });
  }
});

module.exports = profileRouter;

const jwt = require("jsonwebtoken");
const { User } = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("You are not logged in!!!!!");
    }

    const decodedObj = await jwt.verify(token, "password");

    const { _id } = decodedObj;

    const user = await User.findOne({ _id: _id });
    req.user = user;
    if (!user) throw new Error("User does not exist");
    else next();
  } catch (error) {
    res.status(400).send("Error " + error.message);
  }
};

module.exports = userAuth;

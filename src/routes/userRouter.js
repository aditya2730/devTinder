const express = require("express");
const userAuth = require("../midllewares/auth");
const { ConnectionRequest } = require("../model/connectionRequest");
const { User } = require("../model/user");
const userRouter = express.Router();

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allConnections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    });

    if (!allConnections) {
      return res.status(404).json({ message: "connection request not found" });
    }

    const result = await Promise.all(
      allConnections.map(async (connection) => {
        const userId =
          connection.fromUserId === loggedInUser._id
            ? connection.toUserId
            : connection.fromUserId;
        const user = await User.findOne({ _id: userId });
        return user;
      })
    );

    res.send({ message: "Success", result });
  } catch (error) {
    res.status(400).json({ message: `${error.message}` });
  }
});

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { loggedInId } = loggedInUser;
    const allowedStatus = "interested";

    const allRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: allowedStatus,
    });

    const result = await Promise.all(
      allRequests.map(async (request) => {
        const userId =
          request.fromUserId === loggedInId
            ? request.toUserId
            : request.fromUserId;
        const user = await User.findOne({ _id: userId });
        return user;
      })
    );
    res.json({ message: "success", result });
  } catch (error) {
    res.status(400).json({ message: `${error.message}` });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const allConnectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    const hideUserFromFeed = new Set();
    allConnectionRequest.forEach((request) => {
      hideUserFromFeed.add(request.fromUserId);
      hideUserFromFeed.add(request.toUserId);
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select("firstName lastName photoUrl gender age bio skills");

    res.json({ message: users });
  } catch (error) {
    res.status(400).json({ message: `${error.message}` });
  }
});

module.exports = userRouter;

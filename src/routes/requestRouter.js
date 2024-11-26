const express = require("express");
const { User } = require("../model/user");
const { ConnectionRequest } = require("../model/connectionRequest");
const {
  connectionRequestSendValidation,
  connectionRequestRecieveValidation,
} = require("../helper/validation");
const userAuth = require("../midllewares/auth");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      await connectionRequestSendValidation(req);

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({ message: "connection request sent successfully" });
    } catch (error) {
      res.status(400).json({ message: `${error.message}` });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status } = req.params;
      const connectionRequest = await connectionRequestRecieveValidation(req);
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: "connection request", data });
    } catch (error) {
      res.status(400).json({ message: `${error.message}` });
    }
  }
);

module.exports = requestRouter;

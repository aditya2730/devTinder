const validator = require("validator");
const { User } = require("../model/user");
const { ConnectionRequest } = require("../model/connectionRequest");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("invalid Name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("invalid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("please enter a strong password");
  }
};

const validateProfileEditData = (req) => {
  const allowedUpdateFields = [
    "firstName",
    "lastName",
    "skills",
    "age",
    "bio",
    "photoURL",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) => {
    return allowedUpdateFields.includes(field);
  });

  return isEditAllowed;
};

const validatePassword = (req) => {
  if (!validator.isStrongPassword(req.body.newPassword)) {
    return false;
  }
  return true;
};

const connectionRequestSendValidation = async (req) => {
  const fromUserId = req.user._id;
  const toUserId = req.params.toUserId;
  const status = req.params.status;

  if (fromUserId == toUserId) {
    throw new Error("Invalid connection request");
  }

  const toUser = await User.findById({ _id: toUserId });
  if (!toUser) {
    throw new Error("user not found");
  }

  const allowedStatus = ["ignore", "interested"];
  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid status type: " + status);
  }

  const existingConnectionRequest = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: fromUserId, toUserId: toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existingConnectionRequest) {
    throw new Error("connection request already sent!!!!");
  }
};

const connectionRequestRecieveValidation = async (req) => {
  const loggedInUser = req.user;
  const { status, requestId } = req.params;

  const allowedStatus = ["accepted", "rejected"];

  if (!allowedStatus.includes(status)) {
    throw new Error("status is invalid: " + status);
  }

  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: "interested",
  });

  if (!connectionRequest) {
    throw new Error("connection request not found");
  }

  return connectionRequest;
};

module.exports = {
  validateSignUpData,
  validateProfileEditData,
  validatePassword,
  connectionRequestSendValidation,
  connectionRequestRecieveValidation,
};

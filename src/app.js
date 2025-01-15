const express = require("express");
const connectToDb = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectToDb()
  .then((res) => {
    console.log("database is now connected");
    try {
      app.listen(3001, () => {
        console.log("server started successfully");
      });
    } catch (error) {
      console.log("server error");
    }
  })
  .catch((err) => {
    console.log("database error");
    console.log(err.message);
  });

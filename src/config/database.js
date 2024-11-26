const mongoose = require("mongoose");

const connectToDb = async () => {
  await mongoose.connect(
    "mongodb+srv://aditya:0lIZRKEgu3AKbUzK@namastenode.vmcm7.mongodb.net/?retryWrites=true&w=majority&appName=NamasteNode"
  );
};

module.exports = connectToDb;

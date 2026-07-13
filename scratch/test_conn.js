const mongoose = require('mongoose');

const uri = "mongodb+srv://hbalaji1964_db_user:hbalaji1964_db_user@cluster0.3ycyq7k.mongodb.net/?appName=Cluster0";

console.log("Connecting to MongoDB Atlas...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("SUCCESS: Connected to Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILURE: Could not connect to Atlas!", err.message);
    process.exit(1);
  });

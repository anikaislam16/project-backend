const mongoose = require("mongoose");

async function connectToMongoDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://islamanika252:OkPP7MdnGnyBhEBW@student.4omsy08.mongodb.net/student?retryWrites=true&w=majority&appName=student"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}
module.exports = connectToMongoDB;

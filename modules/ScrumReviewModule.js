const mongoose = require("mongoose");

const dailyScrumSchema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  type: {
    type: String,
    enum: ["daily", "sprint"],
   
  },
  scrumDate: {
    type: Date
   // Ensures that each scrum date can only occur once
    
  },
  content: {
    type: String,
   
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScrumProject", // Reference to the Project model if needed
   
  },
});

const DailyScrum = mongoose.model("DailyScrum", dailyScrumSchema);

module.exports = DailyScrum;

const mongoose = require("mongoose");
const Member = require('./MemberModule');
const kanbanProjectSchema = new mongoose.Schema({
  projectName: String,
  projectType: {
    type: String,
    default: "Kanban"
  },
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "KanbanBoard" }],
  members: [{
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    role: String,
    drag: {
      type: String,
      default: "disable"
    },
  },],
  workflow: {
    type: Boolean,
    default: false
  },
  creationTime: {
    type: Date,
    default: () => new Date(),
  },
  weekdays: {
    type: [String], // Assuming you want an array of strings for weekdays
    default: [],    // You can set a default value if needed
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId, ref: "Member",
  },
  projectType: {
    type: String,
    default: "Kanban"
  },
});

const KanbanProject = mongoose.model("KanbanProject", kanbanProjectSchema);

module.exports = { KanbanProject };



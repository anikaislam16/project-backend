const mongoose = require("mongoose");

const QuestionModel = mongoose.Schema(
  {
    question: { type: String }, //Question
    scrumProject: { type: mongoose.Schema.Types.ObjectId, ref: "Scrumproject" },
    kanbanProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kanbanproject",
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }], //by default project er all members

    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Member" }, //j question ask korse
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", QuestionModel);

module.exports = Question;

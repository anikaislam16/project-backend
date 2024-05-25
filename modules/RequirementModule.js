const mongoose = require("mongoose");

const RequirementModule = mongoose.Schema(
  {
    requirement: { type: String }, //Question
    scrumProject: { type: mongoose.Schema.Types.ObjectId, ref: "Scrumproject" },
    kanbanProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kanbanproject",
    },
   
        CardId: {
            type: mongoose.Schema.Types.ObjectId,
        unique:true},
  },
  { timestamps: true }
);

const Requirement = mongoose.model("Requirement", RequirementModule);

module.exports = Requirement;

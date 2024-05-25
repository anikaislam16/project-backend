const mongoose = require("mongoose");
const Member = require("./MemberModule");

const scrumBoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  boardType: {
    type: String,
    enum: ["backlog", "sprint"],
    required: true,
  },
  cards: [
    {
      cardName: String,
      tags: [
        {
          tagName: String,
          color: String,
        },
      ],
      task: [
        {
          taskName: String,
          complete: {
            type: Boolean,
            default: false,
          },
          point: {
            type: Number,
            default: 1,
          },
        },
      ],
      progres: {
        type: String,
        default: "todo",
      },
      startDate: {
        type: Date,
        default: new Date(),
      },
      creationDate: {
        type: Date,

      },
      dueDate: Date,
      priority: String,
      continue: {
        type: Boolean,
        default: false,
      },
      storyPoints: {
        type: Number,
        default: 0,
      },
      members: [
        {
          member_id: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
          role: String,
        },
      ],
      pdf: [{ type: mongoose.Schema.Types.ObjectId, ref: "PDF" }],
      finishedTime: {
        type: Date,
        default: null,
      },
      dependencies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "boardSchema",
          default: [],
        },
      ],
      workflow: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "boardSchema",
          default: [],
        },
      ],
    },
  ],
  sprintStart: Date,
  sprintEnd: Date,
  goal: String,
  started: {
    type: Boolean,
    default: false,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  notCompleted: [
    {
      card_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      status: {
        type: String,
      },
      priority: {
        type: String,
      },
    },
  ],
  removed: [
    {
      card_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      status: {
        type: String,
      },
      priority: {
        type: String,
      },
    },
  ],
});

// Use mongoose.model only once, with the schema as the second parameter
const ScrumBoard = mongoose.model("ScrumBoard", scrumBoardSchema);

module.exports = { ScrumBoard };

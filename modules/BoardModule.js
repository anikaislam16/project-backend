const mongoose = require("mongoose");
const Member = require("./MemberModule");

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
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
      startDate: Date,
      dueDate: Date,
      priority: String,

      members: [
        {
          member_id: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
          role: String,
        },
      ],
      pdf: [{ type: mongoose.Schema.Types.ObjectId, ref: "PDF" }], // Reference to multiple PDF documents
      board: [
        {
          new_start: {
            type: Date,
            default: () => new Date(),
          },
          total: {
            type: Number,
            default: 0,
          },
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "boardSchema", // Reference to the same schema
          },
        },
      ],
      creationTime: {
        type: Date,
        default: () => new Date(),
      },
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
});

// Use mongoose.model only once, with the schema as the second parameter
const KanbanBoard = mongoose.model("KanbanBoard", boardSchema);

module.exports = { KanbanBoard };

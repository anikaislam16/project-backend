const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    content: { type: String },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    Likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }]
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

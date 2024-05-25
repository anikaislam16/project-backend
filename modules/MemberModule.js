const mongoose = require("mongoose");
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: null,
  },
  organization: {
    type: String,
    default: null,
  }
});

const Member = mongoose.model("Member", memberSchema);

module.exports = { Member };

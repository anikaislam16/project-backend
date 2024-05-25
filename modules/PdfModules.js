// PDF.js

const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
  },
});

module.exports = mongoose.model("PDF", pdfSchema);

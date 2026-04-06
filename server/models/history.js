const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  expression: {
    type: String,
    required: true,
    trim: true
  },
  result: {
    type: String,
    required: true,
    trim: true
  },
  mode: {
    type: String,
    enum: ["standard", "scientific"],
    default: "standard"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("History", historySchema);

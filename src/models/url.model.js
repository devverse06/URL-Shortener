const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, unique: true },
  expiresAt: { type: Date },
  clickCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Url", urlSchema);

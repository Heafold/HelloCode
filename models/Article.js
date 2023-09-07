const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  qcm: {
    type: Schema.Types.ObjectId,
    ref: "QCM",
    required: false,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

articleSchema.index({ title: "text" });

module.exports = mongoose.model("Article", articleSchema);

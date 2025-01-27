const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UrlSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: Boolean, default: false },
  },
  { strict: true }
);

module.exports = mongoose.model("Url", UrlSchema);

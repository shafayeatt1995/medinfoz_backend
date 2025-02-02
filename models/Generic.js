const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenericSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
  },
  { strict: true }
);

module.exports = mongoose.model("Generic", GenericSchema);

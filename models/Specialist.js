const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SpecialistSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
  },
  { strict: true }
);

module.exports = mongoose.model("Specialist", SpecialistSchema);

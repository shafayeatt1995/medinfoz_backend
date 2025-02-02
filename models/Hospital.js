const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HospitalSchema = new Schema(
  {
    locationID: { type: Schema.Types.ObjectId, default: null },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
  },
  { strict: true }
);

module.exports = mongoose.model("Hospital", HospitalSchema);

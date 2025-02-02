const mongoose = require("mongoose");
const { randomKey } = require("../utils");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema(
  {
    specialistID: { type: Schema.Types.ObjectId, default: null },
    locationID: { type: Schema.Types.ObjectId, default: null },
    hospitalID: { type: Schema.Types.ObjectId, default: null },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    image: { type: String, default: "" },
    img: { type: String, default: "" },
    degree: { type: String, default: "" },
    specialty: { type: String, default: "" },
    designation: { type: String, default: "" },
    workplace: { type: String, default: "" },
    content: { type: Schema.Types.Mixed, default: "" },
    url: { type: String, required: true },
  },
  { strict: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);

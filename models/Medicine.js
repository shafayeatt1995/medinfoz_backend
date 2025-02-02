const mongoose = require("mongoose");
const { randomKey } = require("../utils");
const Schema = mongoose.Schema;

const MedicineSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    image: { type: String, default: "" },
    img: { type: String, default: "" },
    type: { type: String, required: true },
    typeImage: { type: String, required: true },
    category: { type: String, required: true },
    strength: { type: String, default: "" },
    company: { type: String, required: true },
    package: { type: String, default: "" },
    relatedMedicine: { type: Schema.Types.Mixed, default: null },
    content: { type: Schema.Types.Mixed, required: true },
    bnContent: { type: Schema.Types.Mixed, default: "" },
    url: { type: String, required: true },
  },
  { strict: true }
);

module.exports = mongoose.model("Medicine", MedicineSchema);

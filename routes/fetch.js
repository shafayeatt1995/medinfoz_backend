const express = require("express");
const { Medicine } = require("../models");
const router = express.Router();

router.get("/medicine/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await Medicine.findOne({ slug });
    res.json({ item });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;

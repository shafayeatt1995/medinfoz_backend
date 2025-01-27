const express = require("express");
const router = express.Router();

router.use("/company", require("./company"));

module.exports = router;

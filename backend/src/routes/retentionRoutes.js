const express = require("express");
const router = express.Router();
const {
  getUniqueCountries,
  getUniquePlatforms,
  getAllMetrics,
  getFilteredMetrics,
} = require("../controllers/retentionController");

router.get("/getAllMetrics", getAllMetrics);
router.get("/countries", getUniqueCountries);
router.get("/platforms", getUniquePlatforms);
router.get("/getFilteredMetrics", getFilteredMetrics);

module.exports = router;

const express = require("express");
const puppeteer = require("puppeteer");
const { stringSlug, parseError } = require("../../utils");
const { Url } = require("../../models");
const router = express.Router();
let count = 0;

router.get("/", async (req, res) => {
  try {
    const items = await Url.countDocuments();
    res.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    const page = await getPageNumber(url);
    const urls = Array.from({ length: +page }).map(
      (_, i) => `${url}?page=${i + 1}`
    );

    const browser = await puppeteer.launch();
    const allData = [];

    for (const pageUrl of urls) {
      const page = await browser.newPage();
      await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

      const data = await page.$$eval(".col-xs-12.data-row-top a", (links) =>
        links.map((link) => ({
          name: link.innerHTML.trim(),
          url: link.href,
        }))
      );
      allData.push(...data);
      await page.close();
      console.log(++count);
    }

    await browser.close();

    await Company.bulkWrite(
      allData.map((val) => ({
        updateOne: {
          filter: { slug: stringSlug(val.name) },
          update: { $set: { ...val, slug: stringSlug(val.name) } },
          upsert: true,
        },
      }))
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;

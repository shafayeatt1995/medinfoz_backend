const express = require("express");
const puppeteer = require("puppeteer");
const { stringSlug, parseError, randomKey, sleep } = require("../../utils");
const { Url, Company, Medicine } = require("../../models");
const { makePage, getPageNumber } = require("../../utils/scrap");
const mongoose = require("mongoose");
const sound = require("sound-play");
const path = require("path");
const router = express.Router();
let count = 0;

// router.get("/company-url", async (req, res) => {
//   try {
//     const url = "https://medex.com.bd/companies";
//     const page = await getPageNumber(url);
//     const urls = makePage(url, page);

//     const browser = await puppeteer.launch();
//     const allData = [];

//     for (const pageUrl of urls) {
//       const page = await browser.newPage();
//       await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

//       const data = await page.$$eval(".col-xs-12.data-row-top a", (links) =>
//         links.map((link) => ({
//           name: link.innerHTML.trim(),
//           url: link.href,
//         }))
//       );
//       allData.push(...data);
//       await page.close();
//       console.log(++count);
//     }

//     await browser.close();

//     await Company.insertMany(
//       allData.map((val) => ({ name: val.name, slug: stringSlug(val.name) }))
//     );
//     await Url.insertMany(
//       allData.map((val) => ({ name: "companyUrl", url: val.url }))
//     );

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/generic-allopathic", async (req, res) => {
//   try {
//     const url = "https://medex.com.bd/generics";
//     const pageNumber = await getPageNumber(url);
//     const urls = makePage(url, pageNumber);

//     const browser = await puppeteer.launch();

//     for (const pageUrl of urls) {
//       const page = await browser.newPage();
//       await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

//       const data = await page.$$eval(".col-xs-12.col-sm-6 a", (links) =>
//         links.map((link) => ({
//           name: link.querySelector(".dcind-title").innerHTML.trim(),
//           url: link.href,
//         }))
//       );
//       await page.close();

//       for (const val of data) {
//         const exist = await Medicine.findOne({ slug: stringSlug(val.name) });
//         const slug = stringSlug(val.name);
//         await Medicine.create({
//           type: "Generic (Allopathic)",
//           name: val.name,
//           slug: exist ? `${slug}-${randomKey()}` : slug,
//         });
//         console.log(++count);
//       }
//       await Url.insertMany(
//         data.map((val) => ({ name: "generic-allopathic", url: val.url }))
//       );
//     }

//     await browser.close();

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/generic-herbal", async (req, res) => {
//   try {
//     const url = "https://medex.com.bd/generics?herbal=1";
//     const pageNumber = await getPageNumber(url);
//     const urls = makePage(url, pageNumber, "&");

//     const browser = await puppeteer.launch();

//     for (const pageUrl of urls) {
//       const page = await browser.newPage();
//       await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

//       const data = await page.$$eval(".col-xs-12.col-sm-6 a", (links) =>
//         links.map((link) => ({
//           name: link.querySelector(".dcind-title").innerHTML.trim(),
//           url: link.href,
//         }))
//       );
//       await page.close();

//       for (const val of data) {
//         const exist = await Medicine.findOne({ slug: stringSlug(val.name) });
//         const slug = stringSlug(val.name);
//         await Medicine.create({
//           type: "Generic (Herbal)",
//           name: val.name,
//           slug: exist ? `${slug}-${randomKey()}` : slug,
//         });
//         console.log(++count);
//       }
//       await Url.insertMany(
//         data.map((val) => ({ name: "generic-herbal", url: val.url }))
//       );
//     }

//     await browser.close();

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/medicine-url", async (req, res) => {
//   try {
//     const companyUrls = await Url.find({
//       name: "companyUrl",
//       status: false,
//     });
//     let urls = [];
//     for (let url of companyUrls) {
//       url = !url.url.endsWith("/brands") ? `${url.url}/brands` : url.url;
//       const pageNumber = await getPageNumber(url);
//       urls.push(...makePage(url, pageNumber));
//     }

//     const browser = await puppeteer.launch();
//     for (const pageUrl of urls) {
//       const page = await browser.newPage();
//       await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
//       const data = await page.$$eval("a.hoverable-block", (links) =>
//         links.map((link) => ({
//           name: "medicineUrl",
//           url: link.href,
//         }))
//       );
//       await page.close();
//       await Url.insertMany(data);
//       console.log(++count);
//     }

//     await browser.close();

//     res.send("ok");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
router.get("/add-drug", async (req, res) => {
  try {
    const medicineUrls = await Url.find({
      name: "medicineUrl",
      status: false,
    }).limit(10000);
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
    });
    for (const url of medicineUrls) {
      ++count;

      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });
      await page.goto(url.url, { waitUntil: "domcontentloaded" });

      if (page.url() === "https://medex.com.bd/captcha-challenge") {
        const filePath = path.join(__dirname, "error.mp3");
        sound.play(filePath);
        console.log(count, url.url);

        await page.waitForNavigation({ waitUntil: "networkidle2" });
      }
      const data = await page.evaluate(() => {
        const heading = document.querySelector("h1.page-heading-1-l");
        const name = heading.textContent
          .trim()
          .replace(heading.querySelector("small").textContent, "")
          .trim();
        const type = heading.querySelector("small").textContent.trim();
        const image =
          document.querySelector("a.innovator-brand-badge")?.href || "";
        const typeImage = document.querySelector("img.dosage-icon")?.src || "";
        const categoryLink = document.querySelector(
          'div[title="Generic Name"] > a'
        );
        const category = categoryLink ? categoryLink.innerHTML.trim() : "";
        const strength =
          document.querySelector('div[title="Strength"]').innerHTML.trim() ||
          "";

        const companyLink = document.querySelector(
          'div[title="Manufactured by"] > a'
        );
        const company = companyLink ? companyLink.innerHTML.trim() : "";

        const packageElement = document.querySelector(".package-container");
        if (packageElement) {
          packageElement.removeAttribute("class");
          packageElement.removeAttribute("style");
        }
        const package = packageElement?.innerHTML?.trim() || "";

        const relatedMedicineElements = document.querySelectorAll(
          ".col-xs-12.margin-tb-10 > div > .d-block > a"
        );
        const relatedMedicine = Array.from(relatedMedicineElements).map(
          (el) => ({
            title: el.innerHTML.replace(el.querySelector("span").innerHTML, ""),
            url: el.href,
          })
        );
        const genericDataContainer = document.querySelector(
          ".generic-data-container"
        );
        const contentElements = [...genericDataContainer.children].filter(
          (el) => el.innerHTML.trim() !== ""
        );
        const content = contentElements.reduce(
          (acc, el) => acc + el.outerHTML,
          ""
        );

        return {
          name,
          image,
          type,
          typeImage,
          category,
          strength,
          company,
          package,
          relatedMedicine,
          content,
        };
      });

      const slug = stringSlug(data.name);
      const find = await Medicine.findOne({ slug });
      await Medicine.create({
        ...data,
        url: url.url,
        slug: find ? `${slug}-${randomKey()}` : slug,
      });
      await Url.updateOne({ _id: url._id }, { $set: { status: true } });
      await page.close();
      // await sleep(4000);
    }

    await browser.close();

    res.send("ok");
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;

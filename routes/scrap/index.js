const express = require("express");
const puppeteer = require("puppeteer");
const { stringSlug, parseError, randomKey, sleep } = require("../../utils");
const {
  Url,
  Company,
  Medicine,
  Generic,
  Doctor,
  Location,
  Specialist,
  Hospital,
} = require("../../models");
const { makePage, getPageNumber } = require("../../utils/scrap");
const mongoose = require("mongoose");
const sound = require("sound-play");
const path = require("path");
const router = express.Router();
const sharp = require("sharp");
const https = require("https");
const fs = require("fs");
const publicFolder = path.join(__dirname, "../../../public/images/doctor");
const { UTApi } = require("uploadthing/server");
const utapi = new UTApi();
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
// router.get("/add-drug", async (req, res) => {
//   try {
//     const medicineUrls = await Url.find({
//       name: "medicineUrl",
//       status: false,
//     }).limit(100000);
//     const browser = await puppeteer.launch({
//       headless: false,
//       args: ["--disable-setuid-sandbox"],
//     });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1366, height: 768 });
//     for (const url of medicineUrls) {
//       ++count;

//       await page.goto(url.url, { waitUntil: "domcontentloaded" });

//       if (page.url() === "https://medex.com.bd/captcha-challenge") {
//         const filePath = path.join(__dirname, "error.mp3");
//         sound.play(filePath);
//         console.log(count, url.url);

//         await page.waitForNavigation({ waitUntil: "networkidle2" });
//       }
//       const data = await page.evaluate(() => {
//         const heading = document.querySelector("h1.page-heading-1-l");
//         const name = heading.textContent
//           .trim()
//           .replace(heading.querySelector("small").textContent, "")
//           .trim();
//         const type = heading.querySelector("small").textContent.trim();
//         const image =
//           document.querySelector("a.innovator-brand-badge")?.href || "";
//         const typeImage = document.querySelector("img.dosage-icon")?.src || "";
//         const categoryLink = document.querySelector(
//           'div[title="Generic Name"] > a'
//         );
//         const category = categoryLink ? categoryLink.innerHTML.trim() : "";
//         const strength =
//           document.querySelector('div[title="Strength"]').innerHTML.trim() ||
//           "";

//         const companyLink = document.querySelector(
//           'div[title="Manufactured by"] > a'
//         );
//         const company = companyLink ? companyLink.innerHTML.trim() : "";

//         const packageElement = document.querySelector(".package-container");
//         if (packageElement) {
//           packageElement.removeAttribute("class");
//           packageElement.removeAttribute("style");
//         }
//         const package = packageElement?.innerHTML?.trim() || "";

//         const relatedMedicineElements = document.querySelectorAll(
//           ".col-xs-12.margin-tb-10 > div > .d-block > a"
//         );
//         const relatedMedicine = Array.from(relatedMedicineElements).map(
//           (el) => ({
//             title: el.innerHTML.replace(el.querySelector("span").innerHTML, ""),
//             url: el.href,
//           })
//         );
//         const genericDataContainer = document.querySelector(
//           ".generic-data-container"
//         );
//         const contentElements = [...genericDataContainer.children].filter(
//           (el) => el.innerHTML.trim() !== ""
//         );
//         const content = contentElements.reduce(
//           (acc, el) => acc + el.outerHTML,
//           ""
//         );

//         return {
//           name,
//           image,
//           type,
//           typeImage,
//           category,
//           strength,
//           company,
//           package,
//           relatedMedicine,
//           content,
//         };
//       });

//       const slug = stringSlug(data.name);
//       const find = await Medicine.findOne({ slug });
//       await Medicine.create({
//         ...data,
//         url: url.url,
//         slug: find ? `${slug}-${randomKey()}` : slug,
//       });
//       await Url.updateOne({ _id: url._id }, { $set: { status: true } });
//       // await sleep(4000);
//     }

//     await page.close();
//     await browser.close();

//     res.send("ok");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-company", async (req, res) => {
//   try {
//     const medicines = await Medicine.find().select("company");
//     for (const medicine of medicines) {
//       const company = await Company.findOne({ name: medicine.company });
//       if (!company) {
//         const slug = stringSlug(medicine.company);
//         await Company.create({
//           name: medicine.company,
//           slug: slug,
//         });
//       }
//       console.log(++count);
//     }
//     res.send("ok");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-generic", async (req, res) => {
//   try {
//     const medicines = await Medicine.find().select("category");
//     for (const medicine of medicines) {
//       const generic = await Generic.findOne({ name: medicine.category });
//       if (!generic) {
//         const slug = stringSlug(medicine.category);
//         await Generic.create({
//           name: medicine.category,
//           slug,
//         });
//       }
//       console.log(++count);
//     }
//     res.send("ok");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-image", async (req, res) => {
//   try {
//     const medicines = await Medicine.find({
//       image: { $ne: "" },
//       img: { $exists: false },
//     }).select({
//       image: 1,
//       slug: 1,
//     });
//     for (const medicine of medicines) {
//       const url = medicine.image;
//       const filename = `${medicine.slug}.webp`;
//       const filePath = path.join(publicFolder, filename);
//       if (fs.existsSync(filePath)) {
//         console.log(`${filePath} already exists`);
//         continue;
//       }
//       const file = fs.createWriteStream(`${filePath}.tmp`);
//       await new Promise((resolve, reject) => {
//         https
//           .get(url, (response) => {
//             response.pipe(file);
//             file.on("finish", () => {
//               file.close();
//               sharp(`${filePath}.tmp`)
//                 .webp({ quality: 80 })
//                 .toFile(filePath)
//                 .then(async () => {
//                   await fs.promises.unlink(`${filePath}.tmp`);
//                   medicine.img = `/images/medicine/${filename}`;
//                   await medicine.save();
//                   console.log(++count);
//                   resolve();
//                 })
//                 .catch((err) => {
//                   console.log("err", medicine, err);
//                   reject(err);
//                 });
//             });
//           })
//           .on("error", (err) => {
//             console.log("error", err);
//             reject(err);
//           });
//       });
//     }
//     console.log("complete");
//     res.send("ok");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-doctor-url", async (req, res) => {
//   try {
//     const urls = [
//       "https://www.doctorbangladesh.com/post-sitemap.xml",
//       "https://www.doctorbangladesh.com/post-sitemap2.xml",
//       "https://www.doctorbangladesh.com/post-sitemap3.xml",
//       "https://www.doctorbangladesh.com/post-sitemap4.xml",
//       "https://www.doctorbangladesh.com/post-sitemap5.xml",
//       "https://www.doctorbangladesh.com/post-sitemap6.xml",
//       "https://www.doctorbangladesh.com/post-sitemap7.xml",
//     ];
//     const browser = await puppeteer.launch({
//       headless: false,
//       defaultViewport: null,
//     });
//     const page = await browser.newPage();
//     for (const url of urls) {
//       await page.goto(url, { waitUntil: "networkidle2" });
//       const urls = await page.$eval("table#sitemap", (table) =>
//         Array.from(table.querySelectorAll("a"))
//           .map((a) => a.href)
//           .filter((href) => href.startsWith("https://www.doctorbangladesh.com"))
//       );
//       const data = urls.map((url) => ({ name: "doctor", url }));
//       await Url.insertMany(data);
//     }
//     await page.close();
//     await browser.close();
//     res.send("ok");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-doctor", async (req, res) => {
//   try {
//     const doctors = await Url.find({ name: "doctor", status: false });

//     const browser = await puppeteer.launch({
//       headless: false,
//       defaultViewport: null,
//     });
//     const page = await browser.newPage();
//     for (const doctor of doctors) {
//       await page.goto(doctor.url, { waitUntil: "networkidle2" });
//       const {
//         name,
//         image,
//         degree,
//         specialty,
//         designation,
//         workplace,
//         content,
//       } = await page.evaluate(() => {
//         window.scrollTo(0, document.body.scrollHeight);
//         const name = document.querySelector("h1.entry-title")?.innerText || "";
//         const image =
//           document.querySelector("img.attachment-full.size-full.wp-post-image")
//             .src || "";
//         const degree =
//           document.querySelector('li[title="Degree"]')?.innerText || "";
//         const specialty =
//           document.querySelector('li[title="Specialty"]')?.innerText || "";
//         const designation =
//           document.querySelector('li[title="Designation"]')?.innerText || "";
//         const workplace =
//           document.querySelector('li[title="Workplace"]')?.innerText || "";
//         const content = Array.from(
//           document.querySelectorAll(".entry-content > *")
//         ).reduce((prev, curr) => {
//           if (curr.tagName === "H2") {
//             prev.push({ title: curr.textContent, content: "" });
//           } else if (curr.tagName === "P" && curr.className === "free") {
//           } else if (
//             curr.tagName === "DIV" &&
//             curr.firstChild?.tagName === "P"
//           ) {
//           } else {
//             const last = prev[prev.length - 1];
//             if (last) last.content += curr.outerHTML;
//           }
//           return prev;
//         }, []);
//         return {
//           name,
//           image,
//           degree,
//           specialty,
//           designation,
//           workplace,
//           content,
//         };
//       });
//       const url = doctor.url;
//       const slug = stringSlug(name);
//       const find = await Doctor.findOne({ slug });
//       await Doctor.create({
//         name,
//         slug: find ? `${slug}-${randomKey()}` : slug,
//         image,
//         degree,
//         specialty,
//         designation,
//         workplace,
//         content,
//         url,
//       });
//       doctor.status = true;
//       await doctor.save();
//       console.log(++count);
//     }
//     await page.close();
//     await browser.close();
//     res.send("ok");
//   } catch (error) {
//     const filePath = path.join(__dirname, "error.mp3");
//     sound.play(filePath);
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });

// router.get("/download-image", async (req, res) => {
//   try {
//     const doctors = await Doctor.find({
//       image: { $ne: "" },
//     })
//       .select({ image: 1, slug: 1 })
//       .skip(1644);
//     for (const doctor of doctors) {
//       const url = doctor.image;
//       const filename = `${doctor.slug}.webp`;
//       const filePath = path.join(publicFolder, filename);
//       if (fs.existsSync(filePath)) {
//         console.log(`${filePath} already exists`);
//         continue;
//       }
//       const file = fs.createWriteStream(`${filePath}.tmp`);
//       await new Promise((resolve, reject) => {
//         https
//           .get(url, (response) => {
//             response.pipe(file);
//             file.on("finish", () => {
//               file.close();
//               sharp(`${filePath}.tmp`)
//                 .webp({ quality: 80 })
//                 .toFile(filePath)
//                 .then(async () => {
//                   await fs.promises.unlink(`${filePath}.tmp`);
//                   console.log(++count);
//                   resolve();
//                 })
//                 .catch((err) => {
//                   console.log("err", doctor, err);
//                   reject(err);
//                 });
//             });
//           })
//           .on("error", (err) => {
//             console.log("error", err);
//             reject(err);
//           });
//       });
//     }
//     res.send("ok");
//   } catch (error) {
//     const filePath = path.join(__dirname, "error.mp3");
//     sound.play(filePath);
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-location", async (req, res) => {
//   try {
//     const locations = [
//       "Dhaka",
//       "Chittagong",
//       "Sylhet",
//       "Comilla",
//       "Narayanganj",
//       "Rajshahi",
//       "Rangpur",
//       "Khulna",
//       "Barisal",
//       "Mymensingh",
//       "Pabna",
//       "Bogra",
//       "Kushtia",
//     ];

//     await Location.insertMany(
//       locations.map((val) => ({ name: val, slug: stringSlug(val) }))
//     );

//     res.send("ok");
//   } catch (error) {
//     const filePath = path.join(__dirname, "error.mp3");
//     sound.play(filePath);
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/upload-image", async (req, res) => {
//   try {
//     const medicines = await Medicine.find({
//       img: { $exists: true },
//       image: { $not: /^https:\/\/utfs\.io/ },
//     }).select({
//       img: 1,
//       image: 1,
//       slug: 1,
//     });
//     for (const medicine of medicines) {
//       const imagePath = path.join(publicFolder, medicine.img);
//       const imageBuffer = fs.readFileSync(imagePath);
//       const logoPath = path.join(publicFolder, "/full-logo.png");
//       const logoBuffer = fs.readFileSync(logoPath);

//       const logo = await sharp(logoBuffer)
//         .resize(
//           Math.floor((await sharp(imageBuffer).metadata()).width * 0.25),
//           null
//         )
//         .png()
//         .toBuffer();
//       const webpBuffer = await sharp(imageBuffer)
//         .composite([
//           {
//             input: logo,
//             gravity: "southeast",
//           },
//         ])
//         .webp()
//         .toBuffer();

//       const filename = medicine.slug;
//       const blob = new Blob([webpBuffer], {
//         type: "application/octet-stream",
//       });
//       const uploadData = Object.assign(blob, { name: filename });
//       const { data } = await utapi.uploadFiles(uploadData);
//       medicine.image = data.url;
//       await medicine.save();
//       console.log(++count);
//     }
//     res.send("ok");
//   } catch (error) {
//     const filePath = path.join(__dirname, "error.mp3");
//     sound.play(filePath);
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-specialist", async (req, res) => {
//   try {
//     const browser = await puppeteer.launch({
//       headless: false,
//       defaultViewport: null,
//     });
//     const page = await browser.newPage();
//     await page.goto("https://doctorbangladesh.com", {
//       waitUntil: "networkidle2",
//     });
//     const data = await page.$$eval("ul.sub-menu", (uls) => {
//       const result = [];
//       for (const ul of uls) {
//         result.push(
//           ...Array.from(ul.querySelectorAll("a")).map((link) => link.href)
//         );
//       }
//       return result;
//     });
//     const specialUrls = data
//       .filter((url) =>
//         url.startsWith("https://www.doctorbangladesh.com/doctors")
//       )
//       .slice(6);
//     const specialDatas = [];
//     for (const specialUrl of specialUrls) {
//       await page.goto(specialUrl, { waitUntil: "networkidle2" });
//       const specialPage = await page.$$eval("ul.list", (uls) => {
//         const result = [];
//         for (const ul of uls) {
//           result.push(
//             ...Array.from(ul.querySelectorAll("li a")).map((link) => {
//               const [title, location] = link.textContent.trim().split(" in ");
//               return {
//                 title,
//                 location,
//                 url: link.href,
//               };
//             })
//           );
//         }
//         return result;
//       });
//       specialDatas.push(...specialPage);
//     }
//     for (const specialData of specialDatas) {
//       const { title, location, url } = specialData;

//       // const find = await Specialist.findOne({ name: title.trim() });
//       // if (!find) {
//       //   await Specialist.create({
//       //     name: title.trim(),
//       //     slug: stringSlug(title.trim()),
//       //   });
//       // }

//       console.log(url);
//       await page.goto(url, { waitUntil: "networkidle2" });
//       const doctorDatas = await page.evaluate(() =>
//         Array.from(
//           document.querySelectorAll("ul.doctors > li h3.title > a")
//         ).map((el) => el.href)
//       );
//       console.log(doctorDatas);
//       for (const doctorData of doctorDatas) {
//         const findDoctor = await Doctor.findOne({ url: doctorData });
//         if (findDoctor) {
//           const special = await Specialist.findOne({ name: title.trim() });
//           const loc = await Location.findOne({ name: location.trim() });
//           await Doctor.updateOne(
//             { url: doctorData },
//             {
//               $set: {
//                 specialistID: special._id,
//                 locationID: loc._id,
//                 locationName: location.trim(),
//               },
//             }
//           );
//         }
//         console.log(++count);
//       }
//     }
//     await page.close();
//     await browser.close();
//     res.send("ok");
//   } catch (error) {
//     const filePath = path.join(__dirname, "error.mp3");
//     sound.play(filePath);
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
// router.get("/add-workplace", async (req, res) => {
//   try {
//     const browser = await puppeteer.launch({
//       headless: false,
//       defaultViewport: null,
//     });
//     const page = await browser.newPage();
//     await page.goto("https://doctorbangladesh.com", {
//       waitUntil: "networkidle2",
//     });
//     const data = await page.$$eval("ul.sub-menu li", (lis) => {
//       return lis.map((li) => {
//         const a = li.querySelector("a");
//         return {
//           title: a.textContent.trim(),
//           url: a.href,
//         };
//       });
//     });
//     const hospitalUrls = data.filter((url) =>
//       url.url.startsWith("https://www.doctorbangladesh.com/hospitals")
//     );
//     for (const url of hospitalUrls) {
//       await page.goto(url.url, { waitUntil: "networkidle2" });
//       const hospitalDatas = await page.evaluate(() => {
//         const list = document.querySelector("ul.list");
//         return Array.from(list.querySelectorAll("li")).map((li) => {
//           const a = li.querySelector("a");
//           return {
//             name: a.textContent.trim(),
//             url: a.href,
//           };
//         });
//       });
//       const location = await Location.findOne({ name: url.title });
//       for (const hospital of hospitalDatas) {
//         // const findHospital = await Hospital.findOne({ name: hospital.name });
//         // if (!findHospital) {
//         //   await Hospital.create({
//         //     name: hospital.name,
//         //     slug: stringSlug(hospital.name),
//         //     location: location._id,
//         //   });
//         // }
//         await page.goto(hospital.url, { waitUntil: "networkidle2" });

//         const doctorDatas = await page.evaluate(() =>
//           Array.from(
//             document.querySelectorAll("ul.doctors > li h3.title > a")
//           ).map((el) => el.href)
//         );
//         console.log(doctorDatas);
//         for (const doctorData of doctorDatas) {
//           const findDoctor = await Doctor.findOne({ url: doctorData });
//           if (findDoctor) {
//             const findHospital = await Hospital.findOne({
//               name: hospital.name,
//             });
//             if (findHospital) {
//               await Doctor.updateOne(
//                 { url: doctorData },
//                 { $set: { hospitalID: findHospital._id } }
//               );
//             }
//           }
//         }

//         console.log(++count);
//       }
//     }
//     await page.close();
//     await browser.close();
//     res.send("ok");
//   } catch (error) {
//     const filePath = path.join(__dirname, "error.mp3");
//     sound.play(filePath);
//     console.error(error);
//     return res.status(500).json(parseError(error));
//   }
// });
router.get("/upload-doctor-image", async (req, res) => {
  try {
    const doctors = await Doctor.find({
      img: { $exists: false },
    }).select({
      image: 1,
      slug: 1,
    });
    for (const doctor of doctors) {
      console.log(doctor);
      if (
        doctor.image ===
        "https://www.doctorbangladesh.com/wp-content/uploads/dr-male.jpg"
      ) {
        doctor.img = "/images/dr-male.webp";
      } else if (
        doctor.image ===
        "https://www.doctorbangladesh.com/wp-content/uploads/dr-female.jpg"
      ) {
        doctor.img = "/images/dr-female.webp";
      } else {
        const imagePath = path.join(publicFolder, doctor.slug + ".webp");
        const imageBuffer = fs.readFileSync(imagePath);
        const logoPath = path.join(publicFolder, "/../../full-logo.png");
        const logoBuffer = fs.readFileSync(logoPath);

        const logo = await sharp(logoBuffer)
          .resize(
            Math.floor((await sharp(imageBuffer).metadata()).width * 0.25),
            null
          )
          .png()
          .toBuffer();
        const webpBuffer = await sharp(imageBuffer)
          .composite([{ input: logo, gravity: "southeast" }])
          .webp()
          .toBuffer();

        const filename = doctor.slug;
        const blob = new Blob([webpBuffer], {
          type: "application/octet-stream",
        });
        const uploadData = Object.assign(blob, { name: filename });
        const { data } = await utapi.uploadFiles(uploadData);
        doctor.img = data.url;
      }
      await doctor.save();
      console.log(++count);
    }
    res.send("ok");
  } catch (error) {
    const filePath = path.join(__dirname, "error.mp3");
    sound.play(filePath);
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.get("/translate-medicine", async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .skip(0)
      .limit(1)
      .select({ slug: 1 });
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();

    for (const medicine of medicines) {
      console.log(medicine);
      const url = `https://medinfoz-xyz.translate.goog/medicine/${medicine.slug}?_x_tr_sl=en&_x_tr_tl=bn&_x_tr_hl=en&_x_tr_pto=wapp`;
      await page.goto(url, { waitUntil: "networkidle2" });
      const height = await page.evaluate(() => document.body.scrollHeight);
      await page.evaluate((y) => window.scrollTo(0, y), height / 3);
      await sleep(500);
      await page.evaluate((y) => window.scrollTo(0, y), (height * 2) / 3);
      await sleep(500);
      await page.evaluate((y) => window.scrollTo(0, y), height);
      await sleep(500);
    }
    res.send("ok");
  } catch (error) {
    const filePath = path.join(__dirname, "error.mp3");
    sound.play(filePath);
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;

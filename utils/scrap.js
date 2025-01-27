const puppeteer = require("puppeteer");

const scrap = {
  async getPageNumber(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const count = await page.evaluate(() => {
      const pagination = document.querySelector("ul.pagination");
      if (pagination) {
        const li =
          pagination.querySelectorAll("li")[
            pagination.querySelectorAll("li").length - 2
          ];
        const a = li.querySelector("a");
        return a.innerHTML;
      } else {
        return 1;
      }
    });
    await page.close();
    await browser.close();

    return count;
  },
  makePage(url, page = 1, query = "?") {
    return Array.from({ length: Number(page) }).map(
      (_, i) => `${url}${query}page=${i + 1}`
    );
  },
};

module.exports = scrap;

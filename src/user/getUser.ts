import { PlaywrightCrawler } from "crawlee";
import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }
  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: {
        headless: true,
      },
    },
    requestHandler: async ({ page, request }) => {
      console.log(`Scraping: ${request.url}`);

      await page.context().addCookies([
        {
          name: "li_at",
          value: req.query.token as string,
          domain: ".linkedin.com",
          path: "/",
          httpOnly: true,
          secure: true,
        },
      ]);

      await page.goto(request.url, { waitUntil: "domcontentloaded" });

      await page.waitForSelector('a[href*="fsd_profile"]');
      const link = await page.$eval(
        'a[href*="fsd_profile"]',
        (el: HTMLAnchorElement) => el.href
      );
      const match = link.match(/fsd_profile%3A([A-Za-z0-9_-]+)/);

      if (match) {
        console.log("LinkedIn Internal ID:", match[1]);
        request.userData.linkedinId = match[1];
      }
    },
  });
  const result = await crawler.run([url]);
  return res.status(200).json({ result });
};

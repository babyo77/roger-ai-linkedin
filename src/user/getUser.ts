import { delay } from "../helper";
import { AppError } from "../middleware/asyncHandler";
import { INITIALIZE_BROWSER } from "../playwright.config";
import { Request, Response } from "express";

// not for use

export const getUser = async (req: Request, res: Response) => {
  const { context } = await INITIALIZE_BROWSER(req);

  const page = await context.newPage();
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }
  try {
    // Get the response and headers directly from the goto call
    const response = await page.goto(url);
    const headers = response?.request().headers();

    await page.waitForSelector('a[href*="fsd_profile"]');
    const link = await page.$eval(
      'a[href*="fsd_profile"]',
      (el: any) => el.href
    );

    // Extract `fsd_profile` ID from the URL
    const match = link.match(/fsd_profile%3A([A-Za-z0-9_-]+)/);

    if (match) {
      console.log("LinkedIn Internal ID:", match[1]);
      return res.status(200).json({
        match: match[1],
        headers: headers,
      });
    }
    return res.status(404).json({ message: "fsd_profile ID not found" });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  } finally {
    await page.close();
  }
};

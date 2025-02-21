import { randomDelay, randomMouseMove } from "../helper";
import { AppError } from "../middleware/asyncHandler";
import { INITIALIZE_BROWSER } from "../playwright.config";
import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  const { browser, context } = await INITIALIZE_BROWSER(req);

  const page = await context.newPage();

  try {
    await page.goto("https://www.linkedin.com/in/", {
      waitUntil: "domcontentloaded",
    });

    await randomMouseMove(page);

    const profileLink = page
      .locator(
        `xpath=//div[6]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/div[1]/div[1]/span/a/h1`
      )
      .nth(0);

    const name = await profileLink.textContent();
    if (!name) {
      throw new AppError("Failed to fetch LinkedIn profile", 500);
    }
    await randomDelay();

    return res.status(200).json({ name });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  } finally {
    await browser.close();
  }
};

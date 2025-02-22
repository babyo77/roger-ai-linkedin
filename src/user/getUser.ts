import { randomDelay, randomMouseMove } from "../helper";
import { AppError } from "../middleware/asyncHandler";
import { INITIALIZE_BROWSER } from "../playwright.config";
import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  const { context } = await INITIALIZE_BROWSER(req);

  const page = await context.newPage();

  try {
    await page.goto("https://www.linkedin.com/in/", {
      waitUntil: "domcontentloaded",
    });

    // await randomMouseMove(page);

    const nameElement = await page
      .locator(
        ".artdeco-hoverable-trigger.artdeco-hoverable-trigger--content-placed-bottom"
      )
      .first()
      .textContent();

    const name = nameElement?.trim().replace(/\s+/g, " ").trim();

    if (!name) {
      throw new AppError("Failed to fetch LinkedIn profile name", 500);
    }
    // await randomDelay();

    return res.status(200).json({ name });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  } finally {
    await page.close();
  }
};

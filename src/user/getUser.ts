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

    const name = await page.$$eval(
      `.qZFEXrBJHDYjFOoIqDzEzysWCmDTGIoKr`,
      (elements) => elements[0].textContent?.trim()
    );

    if (!name) {
      throw new AppError("Failed to fetch LinkedIn profile", 500);
    }
    // await randomDelay();

    return res.status(200).json({ name });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  } finally {
    await page.close();
  }
};

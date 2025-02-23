import { delay } from "../helper";
import { AppError } from "../middleware/asyncHandler";
import { INITIALIZE_BROWSER } from "../playwright.config";
import { Request, Response } from "express";

// not for use

export const getUser = async (req: Request, res: Response) => {
  const { context } = await INITIALIZE_BROWSER(req);

  const page = await context.newPage();

  try {
    await page.goto("https://www.linkedin.com/in/", {
      waitUntil: "domcontentloaded",
    });
    await delay(page);
    const [nameElement, imageUrl] = await Promise.all([
      page
        .locator(
          ".artdeco-hoverable-trigger.artdeco-hoverable-trigger--content-placed-bottom"
        )
        .first()
        .textContent(),
      page.locator(".profile-photo-edit__preview").first().getAttribute("src"),
    ]);

    const name = nameElement?.trim().replace(/\s+/g, " ").trim();

    if (!name) {
      throw new AppError("Failed to fetch LinkedIn profile name", 500);
    }
    await delay(page);
    return res.status(200).json({ name, profileImage: imageUrl });
  } catch (error: any) {
    // Take screenshot before throwing error
    const screenshot = await page.screenshot({ fullPage: false });

    res.setHeader("Content-Type", "image/png");
    return res.send(screenshot);
  } finally {
    await page.close();
  }
};

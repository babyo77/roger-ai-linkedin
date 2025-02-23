import { Page } from "playwright";
import { Request, Response } from "express";
import { INITIALIZE_BROWSER } from "../playwright.config";

const initiateConnection = async (page: Page) => {
  // Try primary connect button first
  try {
    await page
      .locator('button:has(span.artdeco-button__text:text("Connect"))')
      .first()
      .click({ timeout: 3000 }); // Add timeout for faster failure
  } catch {
    // Fallback to "More actions" flow
    await page
      .getByRole("button", { name: "More actions" })
      .first()
      .click()
      .then(() =>
        page
          .locator(
            '//span[contains(@class, "display-flex") and contains(@class, "t-normal") and contains(@class, "flex-1") and text()="Connect"]'
          )
          .first() // Use first() instead of nth(1)
          .click()
      );
  }

  // Immediately click "Send without note" after connect button
  await page
    .getByRole("button", { name: "Send without a note" })
    .first()
    .click();
};

export const sendConnectionRequest = async (req: Request, res: Response) => {
  const { context } = await INITIALIZE_BROWSER(req);
  // const sendMessage = req.query.message;
  const linkedinUrl = req.query.linkedinUrl;
  if (!linkedinUrl || typeof linkedinUrl !== "string") {
    return res
      .status(400)
      .json({ message: "linkedinUrl is required and must be a string" });
  }
  const page = await context.newPage();
  try {
    await page.goto(linkedinUrl);
    await initiateConnection(page);
    return res.status(200).json({ message: "Connection request sent" });
  } finally {
    await page.close();
  }
};

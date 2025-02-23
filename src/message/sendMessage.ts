import { Request, Response } from "express";
import { INITIALIZE_BROWSER } from "../playwright.config";
import { delay, randomScroll } from "../helper";

export const sendMessage = async (req: Request, res: Response) => {
  const sendMessage = req.query.message;
  const linkedinUrl = req.query.linkedinUrl;
  if (
    !sendMessage ||
    !linkedinUrl ||
    typeof linkedinUrl !== "string" ||
    typeof sendMessage !== "string"
  ) {
    return res
      .status(400)
      .json({ message: "Message and linkedinUrl are required" });
  }

  const { context } = await INITIALIZE_BROWSER(req);
  const page = await context.newPage();
  try {
    await page.goto(linkedinUrl, {
      waitUntil: "domcontentloaded",
    });

    await randomScroll(page, 1);
    const messageButton = page
      .locator('button:has(span.artdeco-button__text:text("Message"))')
      .nth(1);
    await messageButton.isEnabled();
    await messageButton.hover();
    await messageButton.click();
    await delay(page);
    res.status(200).json({ message: "Message button clicked" });
  } finally {
    await page.close();
  }
};

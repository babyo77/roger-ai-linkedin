import { Page } from "playwright";
import { delay } from "../helper";
import { Request, Response } from "express";
import { INITIALIZE_BROWSER } from "../playwright.config";

const initiateConnection = async (page: Page, message: string) => {
  try {
    // Try primary connect button first
    const messageButton = page
      .locator('button:has(span.artdeco-button__text:text("Connect"))')
      .nth(1);
    try {
      await Promise.race([
        messageButton.click(),
        new Promise((_, reject) => setTimeout(() => reject("Timeout"), 3000)),
      ]);
    } catch {
      // Fallback to more options flow
      const moreButton = page
        .getByRole("button", { name: "More actions" })
        .first();
      await moreButton?.click();

      const connectButton = page
        .locator("div.artdeco-dropdown__item", { hasText: "Connect" })
        .nth(1);
      await connectButton?.click();
    }

    const addNoteButton = page
      .getByRole("button", { name: "Send without a note" })
      .first();
    await addNoteButton?.click();
  } catch (error) {
    throw new Error("Connection request already pending");
  }
};

export const sendConnectionRequest = async (req: Request, res: Response) => {
  const { context } = await INITIALIZE_BROWSER(req);
  const { message: sendMessage, linkedinUrl } = req.query;

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

  const page = await context.newPage();
  try {
    await Promise.all([
      page.goto(linkedinUrl),
      page.waitForLoadState("networkidle"),
    ]);
    await initiateConnection(page, sendMessage);
    return res.status(200).json({ message: "Connection request sent" });
  } finally {
    await page.close(); // Removed delay since we're using waitForLoadState
  }
};

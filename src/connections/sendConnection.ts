import { Page } from "playwright";
import { delay } from "../helper";
import { Request, Response } from "express";
import { INITIALIZE_BROWSER } from "../playwright.config";

const initiateConnection = async (page: Page, message: string) => {
  try {
    const messageButton = page
      .locator('button:has(span.artdeco-button__text:text("Connect"))')
      .nth(1);
    try {
      await messageButton.hover();
      await messageButton.click();
    } catch (error) {
      const moreButton = await page
        .getByRole("button", { name: "More actions" })
        .first();

      console.log("more button found");
      await moreButton?.click();
      console.log("more button clicked");
      await delay(page);
      // Find and click Connect option
      const connectButton = await page
        .locator("div.artdeco-dropdown__item", {
          hasText: "Connect",
        })
        .nth(1);
      console.log("connect button found");
      await connectButton?.click().catch((error) => {
        console.log(error);
      });
    }

    const addNoteButton = await page
      .getByRole("button", {
        name: "Send without a note",
      })
      .first();

    console.log("add note button found");
    await addNoteButton?.hover();
    console.log("add note button hovered");
    await addNoteButton?.click();
  } catch (error) {
    throw new Error("Connection request already pending");
  }
};

export const sendConnectionRequest = async (req: Request, res: Response) => {
  const { browser, context } = await INITIALIZE_BROWSER(req);
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
  const page = await context.newPage();
  try {
    await page.goto(linkedinUrl, {
      waitUntil: "domcontentloaded",
    });
    await initiateConnection(page, sendMessage);
    return res.status(200).json({ message: "Connection request sent" });
  } finally {
    await delay(page);
    await page.close();
  }
};

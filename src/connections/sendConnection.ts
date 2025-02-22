import { Page } from "playwright";
import { randomScroll, randomDelay, delay } from "../helper";
import { Request, Response } from "express";
import { INITIALIZE_BROWSER } from "../playwright.config";

const initiateConnection = async (page: Page, message: string) => {
  await delay(page);
  try {
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

    // Wait for and click "Add a note" button
    const addNoteButton = await page
      .getByRole("button", {
        name: "Send without a note",
      })
      .first();

    console.log("add note button found");
    await addNoteButton?.hover();
    console.log("add note button hovered");
    await delay(page);
    console.log("delay done");
    await addNoteButton?.click();

    //   // Sometimes scroll slightly before typing
    //   await randomScroll(page);
    //   await randomDelay();

    // // Type message with human-like delays
    // const messageInput = await page.locator(
    //   "xpath=/html/body/div[4]/div/div/div[3]/div[1]/textarea"
    // );
    // console.log("message input found");
    // await messageInput?.click();
    // console.log("message input clicked");
    // // Paste the entire message at once, more natural than character-by-character
    // await messageInput?.fill(message);
    // console.log("message input filled");
    // // Click send button
    // const sendButton = await page.locator(
    //   "xpath=/html/body/div[4]/div/div/div[4]/button[2]"
    // );
    // console.log("send button found");
    // await sendButton?.hover();
    // console.log("send button hovered");
    // await delay(page);
    // console.log("delay done");
    // await sendButton?.click();
  } catch (error) {
    throw new Error("Connect button not found");
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
    await page.close();
  }
};

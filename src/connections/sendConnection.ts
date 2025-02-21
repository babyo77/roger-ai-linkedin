import { Page } from "playwright";
import { randomScroll, randomDelay, delay } from "../helper";
import { Request, Response } from "express";
import { INITIALIZE_BROWSER } from "../playwright.config";

const initiateConnection = async (page: Page, message: string) => {
  //   await randomDelay();

  //   await delay(page);
  try {
    let connect = await page.locator(
      "xpath=/html/body/div[6]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/button"
    );

    connect = await page.locator(
      "xpath=/html/body/div[6]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/div[2]"
    );

    connect = await page.locator(
      "xpath=/html/body/div[6]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/div[2]"
    );
    await connect?.hover();
    await delay(page);
    await connect?.click();
  } catch (error) {
    throw new Error("Connect button not found");
  }
  // Find and click Connect option
  const connectButton = await page.locator(
    "xpath=/html/body/div[6]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/div[2]/div/div/ul/li[3]"
  );
  await connectButton?.hover();
  await delay(page);
  await connectButton?.click();

  // Wait for and click "Add a note" button
  const addNoteButton = await page.locator(
    "xpath=/html/body/div[4]/div/div/div[3]/button[1]"
  );
  await addNoteButton?.hover();
  await delay(page);
  await addNoteButton?.click();

  //   // Sometimes scroll slightly before typing
  //   await randomScroll(page);
  //   await randomDelay();

  // Type message with human-like delays
  const messageInput = await page.locator(
    "xpath=/html/body/div[4]/div/div/div[3]/div[1]/textarea"
  );
  await messageInput?.click();

  // Paste the entire message at once, more natural than character-by-character
  await messageInput?.fill(message);

  // Wait a bit before clicking send
  await delay(page);

  // Click send button
  const sendButton = await page.locator(
    "xpath=/html/body/div[4]/div/div/div[4]/button[2]"
  );
  await sendButton?.hover();
  await delay(page);
  await sendButton?.click();
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
  try {
    const page = await context.newPage();
    await page.goto(linkedinUrl, {
      waitUntil: "domcontentloaded",
    });
    await initiateConnection(page, sendMessage);
    return res.status(200).json({ message: "Connection request sent" });
  } finally {
    await browser.close();
  }
};

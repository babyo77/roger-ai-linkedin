import { INITIALIZE_BROWSER } from "../playwright.config";
import { delay, randomMouseMove, randomScroll } from "../helper";
import { Request, Response } from "express";

export const getConnection = async (req: Request, res: Response) => {
  const { browser, context } = await INITIALIZE_BROWSER(req);
  const page = await context.newPage();
  try {
    await page.goto(
      "https://www.linkedin.com/mynetwork/invitation-manager/sent/",
      {
        waitUntil: "domcontentloaded",
      }
    );

    await page.waitForSelector(".artdeco-list .invitation-card", {
      timeout: 10000,
    });

    const newConnections = await page.$$eval(
      ".artdeco-list .invitation-card",
      (cards) => {
        return cards.map((card) => {
          // Get name - handle nested strong/a tags
          const nameElement = card.querySelector(
            ".invitation-card__tvm-title strong a"
          );
          const name = nameElement?.textContent?.trim() || "";

          // Get status from the withdraw button
          const status =
            card.querySelector(".artdeco-button__text")?.textContent?.trim() ||
            "";

          // Get profile link
          const profileLink =
            card
              .querySelector(".invitation-card__picture")
              ?.getAttribute("href") || "";

          // Get subtitle with cleaner text
          const subtitle =
            card
              .querySelector(".invitation-card__subtitle")
              ?.textContent?.replace(/<!---->|<!---->/g, "")
              ?.trim() || "";

          // Get time sent
          const timeSent =
            card.querySelector(".time-badge")?.textContent?.trim() || "";

          return {
            name,
            status,
            profileLink,
            subtitle,
            timeSent,
          };
        });
      }
    );
    if (Math.random() > 0.5) {
      // 50% chance to scroll
      await randomScroll(page, Math.floor(Math.random() * 3) + 1);
    } else {
      await delay(page);
    }
    return res.status(200).json({ connections: Array.from(newConnections) });
  } finally {
    await page.close();
  }
};

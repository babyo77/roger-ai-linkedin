import { INITIALIZE_BROWSER } from "../playwright.config";
import { delay, randomMouseMove, randomScroll } from "../helper";
import { Request, Response } from "express";

export const getConnection = async (req: Request, res: Response) => {
  const { browser, context } = await INITIALIZE_BROWSER(req);
  try {
    const page = await context.newPage();
    await page.goto(
      "https://www.linkedin.com/mynetwork/invitation-manager/sent/",
      {
        waitUntil: "domcontentloaded",
      }
    );

    // await Promise.allSettled([
    //   (async () => {
    //     await randomMouseMove(page);
    //     if (Math.random() > 0.7) {
    //       await page.hover(".invitation-card__picture");
    //     }
    //   })(),
    //   (async () => {
    //     await randomScroll(page);
    //   })(),
    // ]);

    // await delay(page);

    const newConnections = await page.$$eval(".invitation-card", (cards) => {
      return cards.map((card) => {
        const name =
          card
            .querySelector(".invitation-card__tvm-title")
            ?.textContent?.trim()
            ?.split("\n")[0]
            ?.trim() || "";
        const status =
          card.querySelector(".artdeco-button__text")?.textContent?.trim() ||
          "";
        const imageUrl =
          card
            .querySelector(".invitation-card__picture img")
            ?.getAttribute("src") || "";
        return { name, status, imageUrl };
      });
    });
    // await randomScroll(page);

    return res.status(200).json({ connections: Array.from(newConnections) });
  } finally {
    await browser.close();
  }
};

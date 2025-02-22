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

    let previousHeight = 0;
    let allConnections = new Set();

    while (true) {
      const newConnections = await page.$$eval(
        ".artdeco-list .invitation-card",
        (cards) =>
          cards.map((card) => {
            const nameEl = card.querySelector(
              ".invitation-card__details .invitation-card__tvm-title strong a:last-child"
            );
            const imageEl = card.querySelector(".invitation-card__picture img");
            const subtitleEl = card.querySelector(".invitation-card__subtitle");
            const timeEl = card.querySelector(".time-badge");

            return {
              name: nameEl?.textContent?.trim() || "",
              profileUrl: (nameEl as HTMLAnchorElement)?.href || "",
              imageUrl: imageEl?.getAttribute("src") || "",
              subtitle: subtitleEl?.textContent?.trim() || "",
              time: timeEl?.textContent?.trim() || "",
            };
          })
      );

      newConnections.forEach((conn) =>
        allConnections.add(JSON.stringify(conn))
      );

      const currentHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );
      if (currentHeight === previousHeight) {
        break; // No new content loaded
      }

      previousHeight = currentHeight;
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight)
      );
      await page.waitForTimeout(1000); // Wait for content to load
    }

    const totalInvitations = await page.$eval(
      "#mn-invitation-manager__invitation-facet-pills--CONNECTION .artdeco-pill__text",
      (el) => {
        const match = el.textContent?.match(/People \((\d+)\)/);
        return match ? parseInt(match[1]) : 0;
      }
    );

    return res.status(200).json({
      totalInvitations,
      listedConnections: allConnections.size,
      connections: Array.from(allConnections).map((conn) =>
        JSON.parse(conn as string)
      ),
    });
  } finally {
    await page.close();
  }
};

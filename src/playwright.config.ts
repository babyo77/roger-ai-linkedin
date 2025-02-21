import { firefox } from "playwright";
import { getRandomUserAgent } from "./helper";
import { getRandomViewport } from "./helper";
import { AppError } from "./middleware/asyncHandler";
import { Request } from "express";

export const PLAYWRIGHT_CONFIG: {
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  colorScheme: "dark" | "light";
  reducedMotion: "reduce" | "no-preference";
  isMobile: boolean;
} = {
  userAgent: getRandomUserAgent(),
  viewport: getRandomViewport(),
  isMobile: false,
  deviceScaleFactor: Math.random() * (2 - 1) + 1,
  colorScheme: Math.random() > 0.5 ? "dark" : "light",
  reducedMotion: "no-preference",
};

export const BROWSER_CONFIG = {
  headless: true,
  // args: [
  //   "--no-sandbox",
  //   "--disable-setuid-sandbox",
  //   "--disable-dev-shm-usage",
  //   "--disable-accelerated-2d-canvas",
  //   "--disable-gpu",
  //   "--disable-blink-features=AutomationControlled",
  //   "--enable-webgl",
  //   // Add these args to mask automation
  //   "--disable-features=site-per-process",
  //   "--disable-blink-features",
  //   "--disable-infobars",
  //   "--window-position=0,0",
  //   "--ignore-certifcate-errors",
  //   "--ignore-certifcate-errors-spki-list",
  //   `--window-size=${getRandomViewport().width},${getRandomViewport().height}`,
  // ],
  ignoreDefaultArgs: ["--enable-automation"],
  ignoreHTTPSErrors: true,
};

export const INITIALIZE_BROWSER = async (req: Request) => {
  const token = req.headers["li_at"];

  if (!token || typeof token !== "string") {
    throw new AppError("Token is required", 400);
  }

  const browser = await firefox.launch(BROWSER_CONFIG);

  const context = await browser.newContext(PLAYWRIGHT_CONFIG);

  await Promise.all([
    context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    }),
    await context.addCookies([
      {
        name: "li_at",
        value: token,
        domain: ".linkedin.com",
        path: "/",
      },
    ]),
  ]);

  return { browser, context };
};

import { BrowserContext, firefox, FirefoxBrowser } from "playwright";
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
  headless: false,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-blink-features=AutomationControlled",
    "--enable-webgl",
    "--window-position=0,0",
    `--window-size=${getRandomViewport().width},${getRandomViewport().height}`,
  ],
  ignoreDefaultArgs: [
    "--enable-automation",
    "--enable-blink-features=AutomationControlled",
  ],
  ignoreHTTPSErrors: true,
  firefoxUserPrefs: {
    "dom.webdriver.enabled": false,
    "media.navigator.enabled": false,
    "network.http.referer.spoofSource": true,
    "privacy.resistFingerprinting": true,
    "network.http.connection-timeout": 30,
    "network.http.max-connections": 100,
    "general.useragent.override": getRandomUserAgent(),
    "javascript.enabled": true,
    "permissions.default.image": 1,
  },
  timeout: 30000,
};

let activeBrowser: FirefoxBrowser | null = null;

export const INITIALIZE_BROWSER = async (req: Request) => {
  const token = req.headers["li_at"];

  if (!token || typeof token !== "string") {
    throw new AppError("Token is required", 400);
  }

  // Launch browser if it doesn't exist or is disconnected
  if (!activeBrowser || !activeBrowser.isConnected()) {
    activeBrowser = await firefox.launch(BROWSER_CONFIG);
  }

  // Create a new context with fresh cookies for each request
  const context = await activeBrowser.newContext({
    ...PLAYWRIGHT_CONFIG,
    storageState: undefined, // Ensure clean state for each context
  });

  // Set up context with request-specific cookies
  await setupContext(context, token);

  return { browser: activeBrowser, context };
};

// Helper function to setup context
async function setupContext(context: BrowserContext, token: string) {
  await Promise.all([
    context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      const originalQuery = window.navigator.permissions.query;
      // @ts-ignore - We know this implementation is incomplete but it's sufficient for our needs
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({
              state: Notification.permission,
              name: parameters.name,
            })
          : originalQuery(parameters);
    }),
    context.addCookies([
      {
        name: "li_at",
        value: token,
        domain: ".linkedin.com",
        path: "/",
      },
    ]),
  ]);
}

import {
  BrowserContext,
  webkit,
  FirefoxBrowser,
  LaunchOptions,
} from "playwright";
import { AppError } from "./middleware/asyncHandler";
import { Request } from "express";
import { getRandomUserAgent } from "./helper";

export const PLAYWRIGHT_CONFIG: {
  deviceScaleFactor: number;
  colorScheme: "dark" | "light";
  reducedMotion: "reduce" | "no-preference";
  isMobile: boolean;
} = {
  isMobile: false,
  deviceScaleFactor: Math.random() * (2 - 1) + 1,
  colorScheme: Math.random() > 0.5 ? "dark" : "light",
  reducedMotion: "no-preference",
};

export const BROWSER_CONFIG: LaunchOptions = {
  headless: true,
  timeout: 20000,
};

let activeBrowser: FirefoxBrowser | null = null;
let context: BrowserContext | null = null;
let isInitializing = false;

export const INITIALIZE_BROWSER = async (req: Request) => {
  if (isInitializing) {
    console.log("Waiting for initialization...");
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Shorter delay
    }
  }

  if (activeBrowser?.isConnected() && context) {
    await setupContext(context, req.query.token as string);
    return { browser: activeBrowser, context };
  }

  try {
    isInitializing = true;
    activeBrowser?.close(); // Close old instance if any
    console.log("Launching new browser...");
    activeBrowser = await webkit.launch(BROWSER_CONFIG);

    context = await activeBrowser.newContext({
      ...PLAYWRIGHT_CONFIG,
      userAgent: req.headers["user-agent"] || getRandomUserAgent(),
    });

    return { browser: activeBrowser, context };
  } finally {
    isInitializing = false;
  }
};

// Helper function to setup context
async function setupContext(context: BrowserContext, token: string) {
  await Promise.all([
    context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
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

(async () => {
  activeBrowser = await webkit.launch(BROWSER_CONFIG);

  console.log("Browser launched");
})();

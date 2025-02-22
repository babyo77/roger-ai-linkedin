import {
  BrowserContext,
  webkit,
  FirefoxBrowser,
  LaunchOptions,
} from "playwright";
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

export const BROWSER_CONFIG: LaunchOptions = {
  headless: true,
  args: [
    `--window-size=${Math.max(
      getRandomViewport().width,
      getRandomViewport().height
    )},${Math.min(getRandomViewport().width, getRandomViewport().height)}`,
  ],
  timeout: 30000,
};

let activeBrowser: FirefoxBrowser | null = null;
let isInitializing = false;

export const INITIALIZE_BROWSER = async (req: Request) => {
  const token = req.query.token || req.headers["li_at"];

  if (!token || typeof token !== "string") {
    throw new AppError("Token is required", 400);
  }

  // If another request is initializing, wait for a short delay
  while (isInitializing) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
  }

  try {
    isInitializing = true;

    // Launch browser if it doesn't exist or is disconnected
    if (!activeBrowser || !activeBrowser.isConnected()) {
      activeBrowser = await webkit.launch(BROWSER_CONFIG);
    }

    // Create a new context with fresh cookies for each request in private browsing mode
    const context = await activeBrowser.newContext({
      ...PLAYWRIGHT_CONFIG,
      storageState: undefined,
      userAgent: getRandomUserAgent(),
    });

    // Set up context with request-specific cookies
    await setupContext(context, token);

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
})();

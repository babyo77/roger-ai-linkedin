import { chromium as webkit, LaunchOptions, WebKitBrowser } from "playwright";
import { Request } from "express";

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
  timeout: 10000,
};

let activeBrowser: WebKitBrowser | null = null;

export const INITIALIZE_BROWSER = async (req: Request) => {
  if (activeBrowser) {
    const { context } = await setupContext(req.query.token as string);
    return { browser: activeBrowser, context };
  }

  activeBrowser = await webkit.launch(BROWSER_CONFIG);
  const { context } = await setupContext(req.query.token as string);
  return { browser: activeBrowser, context };
};

const setupContext = async (token: string) => {
  if (!activeBrowser) {
    throw new Error("Browser not initialized");
  }
  const context = await activeBrowser.newContext();
  await context.setDefaultTimeout(10000);
  await context.addCookies([
    {
      name: "li_at",
      value: token,
      domain: ".linkedin.com",
      path: "/",
    },
  ]);
  return { context };
};

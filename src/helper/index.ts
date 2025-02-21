import { Page } from "playwright";

function getRandomUserAgent(): string {
  const agents: string[] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:110.0) Gecko/20100101 Firefox/110.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  ];

  return agents[Math.floor(Math.random() * agents.length)];
}

interface Viewport {
  width: number;
  height: number;
}

function getRandomViewport(): Viewport {
  const widths: number[] = [1280, 1366, 1440, 1536, 1600, 1920];
  const heights: number[] = [720, 768, 810, 900, 1080, 1200];

  return {
    width: widths[Math.floor(Math.random() * widths.length)],
    height: heights[Math.floor(Math.random() * heights.length)],
  };
}

async function realisticMouseMove(
  page: any, // Consider importing Page type from puppeteer/playwright
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  steps: number = 40
): Promise<void> {
  // Generate random control points to add variation in paths
  const controlX1 = startX + Math.random() * (endX - startX) * 0.3;
  const controlY1 = startY + Math.random() * (endY - startY) * 0.3;
  const controlX2 = startX + Math.random() * (endX - startX) * 0.7;
  const controlY2 = startY + Math.random() * (endY - startY) * 0.7;

  function bezierCurve(t: number): { x: number; y: number } {
    const oneMinusT = 1 - t;
    return {
      x:
        oneMinusT ** 3 * startX +
        3 * oneMinusT ** 2 * t * controlX1 +
        3 * oneMinusT * t ** 2 * controlX2 +
        t ** 3 * endX,
      y:
        oneMinusT ** 3 * startY +
        3 * oneMinusT ** 2 * t * controlY1 +
        3 * oneMinusT * t ** 2 * controlY2 +
        t ** 3 * endY,
    };
  }

  for (let i = 0; i < steps; i++) {
    const progress = (i + 1) / steps;
    const { x: newX, y: newY } = bezierCurve(progress);

    // Add small random offset to each movement
    const jitterX = (Math.random() - 0.5) * 2;
    const jitterY = (Math.random() - 0.5) * 2;

    await page.mouse.move(newX + jitterX, newY + jitterY, { steps: 1 });

    // Randomize delay for human-like behavior
    await page.waitForTimeout(Math.random() * 20 + 5);
  }
}

async function randomDelay() {
  const minDelay = 1000; // 1 second
  const maxDelay = 3000; // 3 seconds
  return new Promise((resolve) =>
    setTimeout(resolve, minDelay + Math.random() * (maxDelay - minDelay))
  );
}
async function delay(page: Page, ms = 1000) {
  await page.waitForTimeout(ms);
}

const randomMouseMove = async (page: Page) => {
  // Generate a random number of movement steps
  const steps = Math.floor(Math.random() * 10) + 5; // Between 5-15 steps

  // Get the page dimensions
  const viewport = page.viewportSize();
  if (!viewport) return;

  const { width, height } = viewport;

  // Generate a random target position within the viewport
  const targetX = Math.floor(Math.random() * width * 0.8) + width * 0.1; // Keep within 10%-90% of width
  const targetY = Math.floor(Math.random() * height * 0.8) + height * 0.1; // Keep within 10%-90% of height

  // Move the mouse smoothly in random steps
  for (let i = 0; i < steps; i++) {
    const x = Math.floor(targetX + Math.random() * 10 - 5); // Small jitter
    const y = Math.floor(targetY + Math.random() * 10 - 5);

    await page.mouse.move(x, y, { steps: 3 }); // Move in 3 smooth steps
    await page.waitForTimeout(Math.floor(Math.random() * 200) + 100); // Random delay between 100-300ms
  }
};

const randomScroll = async (page: Page) => {
  // Get the total scrollable height of the page
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

  // Generate a random number of scroll steps (between 2 and 5)
  const steps = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < steps; i++) {
    // Generate a random scroll amount
    const scrollAmount = Math.floor(Math.random() * (scrollHeight / 5)) + 100; // Scroll 100px - 20% of page height

    // Scroll smoothly
    await page.evaluate((scrollBy: number) => {
      window.scrollBy({ top: scrollBy, behavior: "smooth" });
    }, scrollAmount);

    // Wait for a random delay between scrolls (200ms - 1s)
    await page.waitForTimeout(Math.floor(Math.random() * 800) + 200);
  }
};

export {
  getRandomUserAgent,
  getRandomViewport,
  realisticMouseMove,
  randomDelay,
  randomMouseMove,
  randomScroll,
  delay,
};

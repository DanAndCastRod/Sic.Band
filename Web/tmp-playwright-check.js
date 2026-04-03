const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  page.on("console", (msg) => console.log("console:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("pageerror:", String(err)));

  console.log("step: goto");
  await page.goto("http://127.0.0.1:8123/universe.html", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  console.log("step: domcontentloaded");

  try {
    await page.waitForFunction(
      () => document.body.dataset.universeReady === "true" || document.body.dataset.universeReady === "error",
      null,
      { timeout: 60000 }
    );
    console.log("step: ready-state", await page.evaluate(() => document.body.dataset.universeReady));
    console.log("sceneStatus:", await page.locator("#scene-status").textContent());
    console.log("inspectTitle:", await page.locator("#inspect-title").textContent());
  } catch (error) {
    console.log("wait failed:", String(error));
    console.log("current ready:", await page.evaluate(() => document.body.dataset.universeReady || "unset"));
    console.log("sceneStatus:", await page.locator("#scene-status").textContent());
  }

  await browser.close();
})();

// Read-only browser regression checks. Run against a local production build.
// PLAYWRIGHT_MODULE may point to an external Playwright installation.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
  : "playwright");
const base = process.env.BIUI_TEST_URL || "http://127.0.0.1:3100";
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) {
  throw new Error("Run against a local application server.");
}
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}),
});
const errors = [];
const sections = ["beneficios", "suscripcion", "atencion", "inicio"];
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    const toggle = page.locator('button[aria-controls="landing-navigation"]');
    await page.waitForFunction(() => document.querySelector('a[aria-current="location"]'));
    for (const id of sections) {
      console.log(`Checking ${width}px/#${id}`);
      if (width < 1024) await toggle.click();
      await nav.locator(`a[href="#${id}"]`).click();
      await page.waitForFunction((id) => location.hash === `#${id}` &&
        document.querySelector(`header a[href="#${id}"][aria-current="location"]`), id);
      const geometry = await page.evaluate((id) => ({
        containerScroll: [...document.querySelectorAll("main, section")].map((node) => node.scrollTop),
        header: document.querySelector("header").getBoundingClientRect().toJSON(),
        targetTop: document.getElementById(id).getBoundingClientRect().top,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }), id);
      assert.ok(geometry.containerScroll.every((value) => value === 0), `Internal clipping at ${width}px/#${id}`);
      assert.ok(geometry.header.top >= 0 && geometry.header.bottom < 130, "Header must remain visible");
      assert.ok(geometry.targetTop >= geometry.header.bottom, "Target must clear the header");
      assert.equal(geometry.overflow, false, `Horizontal overflow at ${width}px`);
      if (width < 1024) {
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        assert.equal(await nav.isVisible(), false);
      }
    }
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('header a[href="#atencion"][aria-current="location"]'));
    await page.goForward();
    await page.waitForFunction(() => document.querySelector('header a[href="#inicio"][aria-current="location"]'));
    await page.goto(`${base}/#suscripcion`);
    await page.waitForFunction(() => document.querySelector('header a[href="#suscripcion"][aria-current="location"]'));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('header a[href="#suscripcion"][aria-current="location"]'));
    if (process.env.BIUI_SCREENSHOT_DIR) {
      await page.screenshot({ path: `${process.env.BIUI_SCREENSHOT_DIR}/landing-${width}.png` });
    }

    if (width < 1024) {
      await toggle.click();
      if (process.env.BIUI_SCREENSHOT_DIR) {
        await page.screenshot({ path: `${process.env.BIUI_SCREENSHOT_DIR}/menu-${width}.png` });
      }
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(await toggle.evaluate((node) => node === document.activeElement), true);
      await toggle.press("Enter");
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      await page.locator("h1").dispatchEvent("pointerdown");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      await toggle.click();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForFunction(() => document.querySelector('[aria-controls="landing-navigation"]').getAttribute("aria-expanded") === "false");
      await page.setViewportSize({ width, height: 900 });
      await page.waitForFunction(() => document.querySelector('[aria-controls="landing-navigation"]').getAttribute("aria-expanded") === "false");
    }
    // Footer anchors use the same destinations and must not clip the main.
    await page.locator('footer a[href="#beneficios"]').click();
    await page.waitForFunction(() => document.querySelector('header a[href="#beneficios"][aria-current="location"]'));
    assert.equal(await page.locator("main").evaluate((node) => node.scrollTop), 0);
    await page.getByRole("link", { name: "Crear cuenta", exact: true }).first().click();
    await page.waitForURL(`${base}/acceso`);
    await page.close();
    console.log(`PASS landing navigation at ${width}px`);
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 360 } });
  page.setDefaultTimeout(15000);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const menuFits = await nav.evaluate((node) => node.getBoundingClientRect().bottom <= innerHeight);
  assert.equal(menuFits, true, "Menu must fit short viewports");
  await nav.locator('a[href="#atencion"]').click();
  await page.waitForFunction(() => document.querySelector('header a[href="#atencion"][aria-current="location"]'));
  assert.equal(await page.locator("main").evaluate((node) => node.scrollTop), 0);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "smooth");
  await page.close();
  console.log("PASS short viewport and smooth scrolling");
  assert.deepEqual(errors, [], "Uncaught browser errors");
  console.log("PASS no uncaught browser errors");
} finally {
  await browser.close();
}

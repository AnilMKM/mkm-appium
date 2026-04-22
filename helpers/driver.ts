import { remote } from "webdriverio";

import { getCapabilities, isBrowserStack } from "./capabilities";

type Browser = Awaited<ReturnType<typeof remote>>;

let driver: Browser | null = null;

/**
 * Creates a new WebDriverIO session.
 *
 * - Local:         connects to the Appium server on 127.0.0.1:4723
 * - BrowserStack:  connects to hub-cloud.browserstack.com (credentials come
 *                  from the `bstack:options` inside the capabilities object)
 *
 * Call this in `beforeAll` and pair with `closeDriver()` in `afterAll`.
 */
export async function createDriver(): Promise<Browser> {
  if (isBrowserStack) {
    driver = await remote({
      protocol: "https",
      hostname: "hub-cloud.browserstack.com",
      port: 443,
      path: "/wd/hub",
      capabilities: getCapabilities(),
      connectionRetryTimeout: 180000,
      connectionRetryCount: 3,
      logLevel: "silent",
    });
  } else {
    driver = await remote({
      protocol: "http",
      hostname: "127.0.0.1",
      port: 4723,
      path: "/",
      capabilities: getCapabilities(),
      connectionRetryTimeout: 120000,
      connectionRetryCount: 3,
      logLevel: process.env.APPIUM_LOG_LEVEL === "verbose" ? "info" : "silent",
    });
  }

  return driver;
}

/**
 * Returns the active driver instance.
 * Throws if `createDriver()` has not been called yet.
 */
export function getDriver(): Browser {
  if (!driver) {
    throw new Error("Driver not initialised — call createDriver() in beforeAll()");
  }

  return driver;
}

/**
 * Closes the WebDriverIO session.
 * Call this in `afterAll`.
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.deleteSession();
    driver = null;
  }
}

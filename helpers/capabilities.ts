/**
 * Appium capabilities for iOS and Android.
 *
 * LOCAL mode (default):
 *   - The app must already be installed on the simulator/emulator.
 *   - iOS:     build with `yarn build:ios:sim`     (from the app repo)
 *   - Android: build with `yarn build:android:sim` (from the app repo)
 *
 * BROWSERSTACK mode (set BROWSERSTACK_USERNAME + BROWSERSTACK_ACCESS_KEY):
 *   - Upload your .ipa/.apk to BrowserStack first:
 *       npx browserstack-upload --username $BS_USER --key $BS_KEY --file path/to/app.ipa
 *   - Then set BS_APP_ID to the returned `bs://...` URL.
 */

const BUNDLE_ID = process.env.BUNDLE_ID ?? "com.mkm.ecommerce.dev";

export const isBrowserStack = !!(
  process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY
);

// ─── Local capabilities ────────────────────────────────────────────────────

export const iosCapabilities = {
  platformName: "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": process.env.IOS_DEVICE ?? "iPhone 17 Pro",
  "appium:platformVersion": process.env.IOS_VERSION ?? "26.3",
  "appium:bundleId": BUNDLE_ID,
  "appium:newCommandTimeout": 240,
  "appium:wdaLaunchTimeout": 60000,
  // Use position/size for visibility instead of native check; can help with nested/tab content
  "appium:simpleIsVisibleCheck": false,
};

export const androidCapabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.ANDROID_DEVICE ?? "emulator-5554",
  "appium:appPackage": BUNDLE_ID,
  "appium:appActivity": ".MainActivity",
  "appium:newCommandTimeout": 240,
  "appium:autoGrantPermissions": true,
};

// ─── BrowserStack App Automate capabilities ────────────────────────────────

const bstackOptions = {
  userName: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  projectName: process.env.BS_PROJECT ?? "MKM App",
  buildName: process.env.BS_BUILD ?? "Local Build",
  sessionName: process.env.BS_SESSION ?? "E2E Tests",
  // Set to true to see detailed Appium logs in the BrowserStack dashboard
  appiumLogs: process.env.BS_APPIUM_LOGS === "true",
};

export const iosBrowserStackCapabilities = {
  platformName: "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": process.env.BS_IOS_DEVICE ?? "iPhone 14",
  "appium:platformVersion": process.env.BS_IOS_VERSION ?? "16",
  // bs://... URL returned after uploading the .ipa to BrowserStack
  "appium:app": process.env.BS_APP_ID,
  "appium:newCommandTimeout": 240,
  "appium:simpleIsVisibleCheck": false,
  "bstack:options": bstackOptions,
};

export const androidBrowserStackCapabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.BS_ANDROID_DEVICE ?? "Samsung Galaxy S23",
  "appium:platformVersion": process.env.BS_ANDROID_VERSION ?? "13.0",
  // bs://... URL returned after uploading the .apk to BrowserStack
  "appium:app": process.env.BS_APP_ID,
  "appium:newCommandTimeout": 240,
  "appium:autoGrantPermissions": true,
  "bstack:options": bstackOptions,
};

// ─── Capability selector ───────────────────────────────────────────────────

export function getCapabilities() {
  const platform = (process.env.PLATFORM ?? "ios").toLowerCase();

  if (isBrowserStack) {
    return platform === "android"
      ? androidBrowserStackCapabilities
      : iosBrowserStackCapabilities;
  }

  return platform === "android" ? androidCapabilities : iosCapabilities;
}

export type Platform = "ios" | "android";

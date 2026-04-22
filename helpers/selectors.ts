import { getDriver } from "./driver";

/**
 * Selectors for React Native elements via Appium.
 *
 * React Native's `testID` prop maps to:
 *   - iOS:     accessibilityIdentifier  →  use `~testID`  (accessibility id)
 *   - Android: resource-id              →  use `~testID`  (accessibility id) or `id=pkg:id/testID`
 *
 * The `~` prefix is Appium's shorthand for the "accessibility id" locator strategy,
 * which works cross-platform for React Native testID values.
 *
 * Component testID conventions in this project:
 *   <Input testID="foo" />  →  TextInput testID is `foo-input`
 *   <Button testID="bar" /> →  Touchable testID is `bar-button`
 */

/** Find element by React Native testID (accessibility id). */
export function byId(testId: string) {
  return getDriver().$(`~${testId}`);
}

/** Wait for element to be displayed, then return it. */
export async function waitForId(testId: string, timeout = 10000) {
  const el = await byId(testId);
  await el.waitForDisplayed({ timeout });

  return el;
}

/** Wait for element to exist in the hierarchy (not necessarily visible). */
export async function waitForExist(testId: string, timeout = 10000) {
  const el = await byId(testId);
  await el.waitForExist({ timeout });

  return el;
}

/**
 * Type text into an Input component.
 * Input's TextInput has testID `${testID}-input`.
 */
export async function typeIntoInput(testId: string, text: string) {
  const input = await waitForId(`${testId}-input`);
  await input.click();
  await input.setValue(text);
}

/**
 * Tap a Button component.
 * Button's touchable has testID `${testID}-button`.
 */
export async function tapButton(testId: string) {
  const button = await waitForId(`${testId}-button`);
  await button.click();
}

/**
 * Wait for a LoadingOverlay to disappear.
 * LoadingOverlay creates a container with testID `${testID}-loading-overlay-container`.
 * This waits for the container to not be displayed (reverse: true).
 */
export async function waitForLoadingOverlayToDisappear(testId: string, timeout = 30000) {
  const loadingContainer = byId(`${testId}-loading-overlay-container`);
  try {
    await loadingContainer.waitForExist({ timeout: 5000 });
  } catch (error) {
    /* overlay might not appear */
  }
  await loadingContainer.waitForDisplayed({ reverse: true, timeout });
}

/**
 * Wait for an element matching a pattern to appear (polling).
 * Uses XPath: elements where name contains the pattern.
 * Per Appium docs: repeat findElement until found or timeout - this is the expected pattern.
 */
export async function waitForElementByPattern(pattern: string, timeout = 15000) {
  const driver = getDriver();
  const element = await driver.$(`//*[contains(@name, "${pattern}")]`);
  await element.waitForExist({ timeout });
  await element.waitForDisplayed({ timeout });
  return element;
}

/**
 * Wait for content to be ready by waiting for an element that appears when loading completes.
 * Skips loading overlay detection (which can be too brief) and waits directly for content.
 * Use this instead of waitForLoadingOverlay when loading is ephemeral.
 */
export async function waitForContentElement(
  xpathPattern: string,
  timeout = 20000
) {
  const driver = getDriver();
  const element = await driver.$(xpathPattern);
  await element.waitForExist({ timeout });
  await element.waitForDisplayed({ timeout });
  return element;
}

/**
 * Wait for any of several elements to appear. Returns the first one that becomes visible.
 * Useful when a screen can render different content (e.g. shop with categories vs trade account banner).
 */
export async function waitForOneOf(testIds: string[], timeout = 20000) {
  const driver = getDriver();
  const startTime = Date.now();
  const interval = 300;

  while (Date.now() - startTime < timeout) {
    for (const testId of testIds) {
      try {
        const el = byId(testId);
        if (await el.isDisplayed()) {
          return el;
        }
      } catch {
        /* try next */
      }
    }
    await driver.pause(interval);
  }

  throw new Error(`None of [${testIds.join(", ")}] became visible within ${timeout}ms`);
}

/**
 * Wait for an element by testID - tries both exist and displayed.
 * On some platforms (e.g. tab content), displayed can fail even when visible.
 * Falls back to checking exist if displayed times out.
 */
export async function waitForIdRelaxed(testId: string, timeout = 15000) {
  const el = byId(testId);
  try {
    await el.waitForExist({ timeout });
    await el.waitForDisplayed({ timeout });
    return el;
  } catch (displayError) {
    await el.waitForExist({ timeout: 5000 });
    return el;
  }
}

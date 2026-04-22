import { createDriver, closeDriver } from "../helpers/driver";
import {
  waitForId,
  waitForIdRelaxed,
  waitForContentElement,
} from "../helpers/selectors";

/**
 * Login flow E2E tests.
 *
 * This test covers the users login flow:
 * 1. PrivacySettingsScreen - Accept privacy settings
 * 2. OnboardScreen - Skip/customise onboarding
 * 3. FirstVisitScreen - Sign into the app
 * 4. LoginScreen - Enter email and password
 *
 * testID reference:
 *   privacy-settings-screen-accept-all-button → Accept & Continue button
 *   onboard-screen-customise-button → Skip This button
 *   first-visit-screen-sign-in-button → Sign In button
 *   login-screen-email-input → Email input
 *   login-screen-password-input → Password input
 *   sign-in-button → Sign In button
 */

describe("Users Login Flow", () => {
  beforeAll(async () => {
    await createDriver();
  });

  afterAll(async () => {
    await closeDriver();
  });

  it("completes the users login flow", async () => {
    // Step 1: Accept privacy settings
    const privacyScreen = await waitForId("privacy-settings-screen", 30000);
    expect(await privacyScreen.isDisplayed()).toBe(true);

    const acceptButton = await waitForId("privacy-settings-screen-accept-all-button-button", 10000);
    await acceptButton.click();

    // Step 2: Skip onboarding slides
    const onboardScreen = await waitForId("onboard-screen", 10000);
    expect(await onboardScreen.isDisplayed()).toBe(true);

    const customiseButton = await waitForId("onboard-screen-customise-button-button", 10000);
    await customiseButton.click();

    // Step 3: Sign in to the app
    const firstVisitScreen = await waitForId("first-visit-screen", 10000);
    expect(await firstVisitScreen.isDisplayed()).toBe(true);

    const signInButton = await waitForId("first-visit-screen-sign-in-button-button", 10000);
    await signInButton.click();

    const emailInput = await waitForId("login-screen-email-input", 10000);
    await emailInput.click();
    await emailInput.setValue("contact.cu.108@obfuscated.mkmbs.co.uk");

    const passwordInput = await waitForId("login-screen-password-input", 10000);
    await passwordInput.click();
    await passwordInput.setValue("P@ssw0rd");

    const signInButtonLogin = await waitForId("sign-in-button-button", 10000);
    await signInButtonLogin.click();

    // Optional "Not Now" popup
    try {
      const notNowButton = await waitForContentElement(
        '//*[contains(@name, "Not Now") or contains(@label, "Not Now")]',
        4000,
      );
      await notNowButton.click();
    } catch {
      /* dismiss may not appear */
    }

    // Step 4: Verify we landed on the Your Account Screen
    const yourAccountScreen = await waitForIdRelaxed("your-account-screen", 30000);
    expect(await yourAccountScreen.isExisting()).toBe(true);
  });
});

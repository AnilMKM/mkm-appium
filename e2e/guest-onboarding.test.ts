import { createDriver, closeDriver } from "../helpers/driver";
import {
  waitForId,
  waitForContentElement,
  waitForOneOf,
  waitForElementByPattern,
} from "../helpers/selectors";

/**
 * Guest onboarding flow E2E tests.
 *
 * This test covers the complete guest onboarding flow:
 * 1. PrivacySettingsScreen - Accept privacy settings
 * 2. OnboardScreen - Skip/customise onboarding
 * 3. FirstVisitScreen - Start shopping as guest
 * 4. GuestBranchSelectionScreen - Use current location
 * 5. BranchSelectionResultsScreen - Wait for results and tap first branch
 * 6. BranchSelectionDetailsScreen - Wait for details and tap "Select This Branch"
 * 7. ShopMenuScreen - Verify landing on shop screen
 *
 * testID reference:
 *   privacy-settings-screen-accept-all-button → Accept & Continue button
 *   onboard-screen-customise-button → Skip This button
 *   first-visit-screen-start-shopping-button → Start Shopping button
 *   guest-branch-selection-screen-current-location-text → Use current location text button
 *   branch-search-nearest-{id}-menu-item → Branch result menu item
 *   select-branch-button → Select This Branch button
 *   shop-menu-screen → Shop menu screen container
 */

describe("Guest Onboarding Flow", () => {
  beforeAll(async () => {
    await createDriver();
  });

  afterAll(async () => {
    await closeDriver();
  });

  it("completes the guest onboarding flow", async () => {
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

    // Step 3: Start shopping as guest
    const firstVisitScreen = await waitForId("first-visit-screen", 10000);
    expect(await firstVisitScreen.isDisplayed()).toBe(true);

    const startShoppingButton = await waitForId("first-visit-screen-start-shopping-button-button", 10000);
    await startShoppingButton.click();

    // Step 4: Use current location for branch selection
    const branchSelectionScreen = await waitForId("guest-branch-selection-screen", 10000);
    expect(await branchSelectionScreen.isDisplayed()).toBe(true);

    const currentLocationButton = await waitForId("guest-branch-selection-screen-current-location-text-text-button", 10000);
    await currentLocationButton.click();

    // Step 5: Wait for branch results - detect when content (first branch item) appears
    // BranchNearest: MenuItem testID = branch-search-nearest-{id}, MenuItem adds -menu-item
    const firstBranchItem = await waitForContentElement(
      '//*[contains(@name, "branch-search-nearest") and contains(@name, "menu-item")]',
      20000
    );
    await firstBranchItem.click();

    // Step 6: Wait for BranchSelectionDetailsScreen - detect when "Select" button appears
    const selectBranchButton = await waitForId("select-branch-button", 20000);
    await selectBranchButton.click();

    // Step 7: Verify we landed on the Shop Menu Screen
    let shopElement;
    try {
      shopElement = await waitForOneOf(
        ["shop-menu-screen", "guest-menu-trade-account-image-container"],
        15000
      );
    } catch {
      shopElement = await waitForElementByPattern("category-", 10000);
    }
    expect(await shopElement.isDisplayed()).toBe(true);
  });
});

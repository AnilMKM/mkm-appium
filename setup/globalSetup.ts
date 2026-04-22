import { spawn } from "child_process";
import http from "http";

import { isBrowserStack } from "../helpers/capabilities";

const APPIUM_PORT = 4723;

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    http
      .get(`http://127.0.0.1:${port}/status`, (res) => {
        resolve(res.statusCode === 200);
      })
      .on("error", () => resolve(false));
  });
}

async function waitForAppium(port: number, retries = 30): Promise<void> {
  for (let i = 0; i < retries; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (await isPortInUse(port)) return;
    process.stdout.write(`  Waiting for Appium... (${i + 1}/${retries})\r`);
  }
  throw new Error(`Appium did not become ready on port ${port} within ${retries}s`);
}

export default async function globalSetup(): Promise<void> {
  // BrowserStack manages its own Appium infrastructure — nothing to start locally
  if (isBrowserStack) {
    if (!process.env.BS_APP_ID) {
      throw new Error(
        "BS_APP_ID is required for BrowserStack runs.\n" +
          "Upload your .ipa/.apk first and set BS_APP_ID to the returned bs://... URL.",
      );
    }
    console.log("\nBrowserStack App Automate — skipping local Appium startup\n");
    process.env.APPIUM_MANAGED = "false";
    return;
  }

  // If Appium is already running (e.g. started manually), skip spawning
  if (await isPortInUse(APPIUM_PORT)) {
    console.log(`\nAppium already running on port ${APPIUM_PORT}\n`);
    process.env.APPIUM_MANAGED = "false";
    return;
  }

  console.log("\nStarting Appium server...");

  const server = spawn("appium", ["--port", String(APPIUM_PORT)], {
    stdio: process.env.APPIUM_VERBOSE === "true" ? "inherit" : "ignore",
    detached: false,
  });

  server.on("error", (err) => {
    throw new Error(
      `Failed to start Appium: ${err.message}\n` + `Make sure Appium is installed globally: npm install -g appium`,
    );
  });

  if (!server.pid) {
    throw new Error("Appium process did not start (no PID)");
  }

  process.env.APPIUM_SERVER_PID = String(server.pid);
  process.env.APPIUM_MANAGED = "true";

  await waitForAppium(APPIUM_PORT);
  console.log(`\nAppium server ready on port ${APPIUM_PORT} (PID: ${server.pid})\n`);
}

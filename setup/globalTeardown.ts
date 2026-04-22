export default async function globalTeardown(): Promise<void> {
  if (process.env.APPIUM_MANAGED !== "true") return;

  const pid = process.env.APPIUM_SERVER_PID;

  if (pid) {
    console.log(`\nStopping Appium server (PID: ${pid})...`);
    try {
      process.kill(parseInt(pid, 10), "SIGTERM");
    } catch {
      // Process may have already exited
    }
  }
}

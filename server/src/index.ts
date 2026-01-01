import fs from "node:fs/promises";
import { createApp } from "./app";
import { loadConfig } from "./config/config";

/**
 * Bootstraps the API server.
 */
async function main(): Promise<void> {
  const config = loadConfig();
  await fs.mkdir(config.outputRoot, { recursive: true });

  const app = createApp(config);

  app.listen(config.port, () => {
    console.info(`Server listening on http://localhost:${config.port}`);
    console.info(`Output root: ${config.outputRoot}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

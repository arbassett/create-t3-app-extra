import type { InstallerOptions } from "~/installers/index.js";
import { DEFAULT_APP_NAME } from "~/consts.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";

// This logs the next steps that the user should take in order to advance the project
export const logNextSteps = ({
  projectName = DEFAULT_APP_NAME,
  packages,
  noInstall,
}: Pick<
  InstallerOptions<"vite:client"> | InstallerOptions<"vite:server">,
  "projectName" | "packages" | "noInstall"
>) => {
  const pkgManager = getUserPkgManager();

  if (packages.includes("trpc")) {
    logger.info("TRPC:");
    logger.info("  spin up a create-t3-app on port 3000 for api access");
    logger.info("  you may have to setup cors\n");
  }

  if (packages.includes("nextAuth")) {
    logger.info("NextAuth:");
    logger.warn(
      "  NextAuth installer is active but runtime is not fully setup\n",
    );
  }

  logger.info("Next steps:");
  projectName !== "." && logger.info(`  cd ${projectName}`);
  if (noInstall) {
    // To reflect yarn's default behavior of installing packages when no additional args provided
    if (pkgManager === "yarn") {
      logger.info(`  ${pkgManager}`);
    } else {
      logger.info(`  ${pkgManager} install`);
    }
  }

  // if (packages.includes("prisma")) {
  //   logger.info(
  //     `  ${pkgManager === "npm" ? "npx" : pkgManager} prisma db push`,
  //   );
  // }

  logger.info(`  ${pkgManager === "npm" ? "npm run" : pkgManager} dev`);
};

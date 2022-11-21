import path from "path";
import { runCli } from "./cli/index.js";
import { scaffoldProject } from "./helpers/scaffoldProject.js";
import { getUserPkgManager } from "./utils/getUserPkgManager.js";
import { logger } from "./utils/logger.js";
import { parseNameAndPath } from "./utils/parseNameAndPath.js";
import { renderTitle } from "./utils/renderTitle.js";

const main = async () => {
  renderTitle();

  const cliResult = await runCli();

  const [appDir] = parseNameAndPath(cliResult.appName);
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), appDir);

  // Bootstraps the base Next.js application
  await scaffoldProject({
    projectName: appDir,
    projectDir,
    pkgManager,
    noInstall: false,
  });
};

main().catch((err) => {
  logger.error("Aborting installation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:",
    );
    console.log(err);
  }
  process.exit(1);
});

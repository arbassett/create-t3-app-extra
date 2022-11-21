import path from "path";
import fs from "fs-extra";
import { runCli } from "./cli/index.js";
import { initializeGit } from "./helpers/git.js";
import { installDependencies } from "./helpers/installDependencies.js";
import { logNextSteps } from "./helpers/logNextSteps.js";
import { scaffoldProject } from "./helpers/scaffoldProject.js";
import { Frameworks, installPackages } from "./installers/index.js";
import { getUserPkgManager } from "./utils/getUserPkgManager.js";
import { logger } from "./utils/logger.js";
import { parseNameAndPath } from "./utils/parseNameAndPath.js";
import { renderTitle } from "./utils/renderTitle.js";
import { PackageJson } from "type-fest";
import { getVersion } from "./utils/getT3Version.js";

type CT3APackageJSON = PackageJson & {
  ct3aeMetadata?: {
    initVersion: string;
    framework: Frameworks;
  };
};

const main = async () => {
  renderTitle();

  const cliResult = await runCli();

  const [scopedAppName, appDir] = parseNameAndPath(cliResult.appName);
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), appDir);

  // Bootstraps the base Next.js application
  await scaffoldProject({
    projectName: appDir,
    projectDir,
    pkgManager,
    noInstall: false,
    framework: cliResult.framework,
    packages: cliResult.packages,
  });

  if (cliResult.packages.length > 0) {
    await installPackages({
      projectName: appDir,
      projectDir,
      pkgManager,
      noInstall: false,
      framework: cliResult.framework,
      packages: cliResult.packages,
    });
  }

  //TODO: allow noInstall & no git init
  await installDependencies({ projectDir });

  await initializeGit(projectDir);

  logNextSteps({
    projectName: appDir,
    packages: cliResult.packages,
    noInstall: false,
  });

  // Write name to package.json
  const pkgJson = fs.readJSONSync(
    path.join(projectDir, "package.json"),
  ) as CT3APackageJSON;
  pkgJson.name = scopedAppName;
  pkgJson.ct3aMetadata = {
    initVersion: getVersion(),
    framework: cliResult.framework,
  };
  fs.writeJSONSync(path.join(projectDir, "package.json"), pkgJson, {
    spaces: 2,
  });

  process.exit(0);
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

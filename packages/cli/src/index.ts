import path from "path";
import fs from "fs-extra";
import { runCli } from "./cli/index.js";
import { initializeGit } from "./helpers/git.js";
import { installDependencies } from "./helpers/installDependencies.js";
import { logNextSteps } from "./helpers/logNextSteps.js";
import { scaffoldProject } from "./helpers/scaffoldProject.js";
import {
  Frameworks,
  InstallerOptions,
  installPackages,
} from "./installers/index.js";
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

  const installOptions: InstallerOptions<"vite:client" | "vite:server"> = {
    projectName: appDir,
    projectDir,
    pkgManager,
    noInstall: cliResult.flags.noInstall,
    framework: cliResult.framework,
    packages: cliResult.packages,
  };

  // Bootstraps the base application
  await scaffoldProject(installOptions);

  if (cliResult.packages.length > 0) {
    await installPackages(installOptions);
  }

  if (!cliResult.flags.noInstall) {
    await installDependencies({ projectDir });
  }
  if (!cliResult.flags.noGit) {
    await initializeGit(projectDir);
  }
  logNextSteps({
    projectName: appDir,
    packages: cliResult.packages,
    noInstall: cliResult.flags.noInstall,
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

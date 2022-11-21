// MIT License

// Copyright (c) 2022 Shoubhit Dash

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import ora from "ora";
import { PKG_ROOT } from "~/consts.js";
import { InstallerOptions } from "~/installers/index.js";
import { logger } from "~/utils/logger.js";

// This bootstraps the base Next.js application
export const scaffoldProject = async ({
  projectName,
  projectDir,
  pkgManager,
  noInstall,
}: InstallerOptions<"vite:client" | "vite:server">) => {
  const srcDir = path.join(PKG_ROOT, "templates/vite:base");

  if (!noInstall) {
    logger.info(`\nUsing: ${chalk.cyan.bold(pkgManager)}\n`);
  } else {
    logger.info("");
  }

  const spinner = ora(`Scaffolding in: ${projectDir}...\n`).start();

  if (fs.existsSync(projectDir)) {
    if (fs.readdirSync(projectDir).length === 0) {
      spinner.info(
        `${chalk.cyan.bold(projectName)} exists but is empty, continuing...\n`,
      );
    } else {
      spinner.stopAndPersist();
      const { overwriteDir } = await inquirer.prompt<{
        overwriteDir: "abort" | "clear" | "overwrite";
      }>({
        name: "overwriteDir",
        type: "list",
        message: `${chalk.redBright.bold("Warning:")} ${chalk.cyan.bold(
          projectName,
        )} already exists and isn't empty. How would you like to proceed?`,
        choices: [
          {
            name: "Abort installation (recommended)",
            value: "abort",
            short: "Abort",
          },
          {
            name: "Clear the directory and continue installation",
            value: "clear",
            short: "Clear",
          },
          {
            name: "Continue installation and overwrite conflicting files",
            value: "overwrite",
            short: "Overwrite",
          },
        ],
        default: "abort",
      });
      if (overwriteDir === "abort") {
        spinner.fail("Aborting installation...");
        process.exit(0);
      }

      const overwriteAction =
        overwriteDir === "clear"
          ? "clear the directory"
          : "overwrite conflicting files";

      const { confirmOverwriteDir } = await inquirer.prompt<{
        confirmOverwriteDir: boolean;
      }>({
        name: "confirmOverwriteDir",
        type: "confirm",
        message: `Are you sure you want to ${overwriteAction}?`,
        default: false,
      });

      if (!confirmOverwriteDir) {
        spinner.fail("Aborting installation...");
        process.exit(0);
      }

      if (overwriteDir === "clear") {
        spinner.info(
          `Emptying ${chalk.cyan.bold(projectName)} and creating t3 app..\n`,
        );
        fs.emptyDirSync(projectDir);
      }
    }
  }

  spinner.start();

  fs.copySync(srcDir, projectDir);
  fs.renameSync(
    path.join(projectDir, "_gitignore"),
    path.join(projectDir, ".gitignore"),
  );

  const scaffoldedName =
    projectName === "." ? "App" : chalk.cyan.bold(projectName);

  spinner.succeed(
    `${scaffoldedName} ${chalk.green("scaffolded successfully!")}\n`,
  );
};

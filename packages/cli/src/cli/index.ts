import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import { CREATE_T3_VITE_APP, DEFAULT_APP_NAME } from "~/consts.js";
import { frameworkPackages, Frameworks } from "~/installers/index.js";
import { getVersion } from "~/utils/getT3Version.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";
import { validateAppName } from "~/utils/validateAppName.js";

interface CLIFlags {
  noInstall: boolean;
  noGit: boolean;
  noFormat: boolean;
}

interface CLIResult<T extends Frameworks> {
  appName: string;
  framework: T;
  packages: typeof frameworkPackages[T];
  flags: CLIFlags;
}

export type CliResults = CLIResult<"vite:client" | "vite:server">;

export const runCli = async (): Promise<CliResults> => {
  const program = new Command().name(CREATE_T3_VITE_APP);

  program
    .description("A CLI for creating web applications based on the T3 stack")
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false,
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false,
    )
    .option(
      "--noFormat",
      "Explicitly tell the CLI to not run eslint --fix",
      false,
    )
    .version(getVersion(), "-v, --version", "Display the version number")
    .addHelpText(
      "afterAll",
      `\n This cli is based on the wonderful ${chalk
        .hex("#E8DCFF")
        .bold(
          "create-t3-app",
        )}. its goal is to experiment with alternative frameworks built on the T3 stack`,
    )
    .addHelpText(
      "afterAll",
      `\n For a more stable T3 application please use ${chalk
        .hex("#E8DCFF")
        .bold("create-t3-app")}\n`,
    )
    .parse(process.argv);

  const appName = await promptAppName();
  const framework = await promptFramework();
  const packages = await promptPackages(frameworkPackages[framework]);
  const flags: CLIFlags = program.opts();

  if (!flags.noGit) {
    flags.noGit = !(await promptGit());
  }

  if (!flags.noInstall) {
    flags.noInstall = !(await promptInstall());
  }

  return {
    appName,
    framework,
    packages,
    flags,
  };
};

const promptAppName = async (): Promise<string> => {
  const { appName } = await inquirer.prompt<{ appName: string }>({
    name: "appName",
    type: "input",
    message: "What will your project be called?",
    default: DEFAULT_APP_NAME,
    validate: validateAppName,
    transformer: (input: string) => {
      return input.trim();
    },
  });

  return appName;
};

const promptFramework = async () => {
  const { framework } = await inquirer.prompt<{ framework: Frameworks }>({
    name: "framework",
    type: "list",
    message: "What framework do you want to use?",
    choices: [
      { name: "Vite Client", value: "vite:client", short: "Vite Client" },
      // {
      //   name: "Vite Server",
      //   value: "vite:server",
      //   short: "Vite Server",
      // },
    ],
    default: "vite:client",
  });
  return framework;
};

const promptPackages = async <T extends Frameworks>(
  packageList: typeof frameworkPackages[T],
) => {
  const { packages } = await inquirer.prompt<{
    packages: typeof frameworkPackages[T];
  }>({
    name: "packages",
    type: "checkbox",
    message: "What packages should be added?",
    choices: packageList.map((p) => ({ name: p, checked: false })),
  });

  return packages;
};

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
const promptGit = async (): Promise<boolean> => {
  const { git } = await inquirer.prompt<{ git: boolean }>({
    name: "git",
    type: "confirm",
    message: "Initialize a new git repository?",
    default: true,
  });

  if (git) {
    logger.success("Nice one! Initializing repository!");
  } else {
    logger.info("Sounds good! You can come back and run git init later.");
  }

  return git;
};

const promptInstall = async (): Promise<boolean> => {
  const pkgManager = getUserPkgManager();

  const { install } = await inquirer.prompt<{ install: boolean }>({
    name: "install",
    type: "confirm",
    message:
      `Would you like us to run '${pkgManager}` +
      (pkgManager === "yarn" ? `'?` : ` install'?`),
    default: true,
  });

  if (install) {
    logger.success("Alright. We'll install the dependencies for you!");
  } else {
    if (pkgManager === "yarn") {
      logger.info(
        `No worries. You can run '${pkgManager}' later to install the dependencies.`,
      );
    } else {
      logger.info(
        `No worries. You can run '${pkgManager} install' later to install the dependencies.`,
      );
    }
  }

  return install;
};

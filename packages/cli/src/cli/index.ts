import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import { CREATE_T3_VITE_APP, DEFAULT_APP_NAME } from "~/consts.js";
import { frameworkPackages, Frameworks } from "~/installers/index.js";
import { getVersion } from "~/utils/getT3Version.js";
import { validateAppName } from "~/utils/validateAppName.js";
interface CLIResult<T extends Frameworks> {
  appName: string;
  framework: T;
  packages: typeof frameworkPackages[T];
  flags: {
    noInstall: boolean;
    noGit: boolean;
  };
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

  return {
    appName,
    framework,
    packages,
    flags: program.opts(),
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
      //   name: "Vite Client & Server",
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

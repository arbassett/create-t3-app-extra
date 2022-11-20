import { Command } from "commander";
import inquirer from "inquirer";
import { CREATE_T3_VITE_APP, DEFAULT_APP_NAME } from "~/consts";
import { frameworkPackages, Frameworks } from "~/installers/index";
import { Packages } from "~/installers/types";
import { validateAppName } from "~/utils/validateAppName";

interface CLIResult<T extends Frameworks> {
  appName: string;
  framework: T;
  packages: typeof frameworkPackages[T];
}

export type CliResults = CLIResult<"vite:client" | "vite:server">;

export const runCli = async (): Promise<CliResults> => {
  const program = new Command().name(CREATE_T3_VITE_APP);

  const appName = await promptAppName();
  const framework = await promptFramework();
  const packages = await promptPackages(frameworkPackages[framework]);

  return {
    appName,
    framework,
    packages,
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
      {
        name: "Vite Client & Server",
        value: "vite:server",
        short: "Vite Server",
      },
    ],
    default: "typescript",
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

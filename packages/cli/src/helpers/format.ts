import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import { PKG_ROOT } from "~/consts.js";
import { logger } from "~/utils/logger.js";

type Options = {
  projectDir: string;
  noInstall: boolean;
};

export const formatProject = async ({ projectDir, noInstall }: Options) => {
  logger.info("Formatting project...");
  const spinner = ora(`Running prettier ...\n`).start();

  if (noInstall) {
    await execa(
      "node",
      [
        `${PKG_ROOT}/node_modules/prettier/bin-prettier.js`,
        "--no-config",
        "--write",
        ".",
      ],
      {
        cwd: projectDir,
      },
    );
  } else {
    await execa("prettier", ["--write", "."], {
      cwd: projectDir,
    });
  }

  spinner.succeed(chalk.green("Successfully formatted project!\n"));
};

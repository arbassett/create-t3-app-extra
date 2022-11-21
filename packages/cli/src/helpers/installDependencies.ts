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
import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";

type Options = {
  projectDir: string;
};

export const installDependencies = async ({ projectDir }: Options) => {
  logger.info("Installing dependencies...");
  const pkgManager = getUserPkgManager();
  const spinner =
    pkgManager === "yarn"
      ? ora("Running yarn...\n").start()
      : ora(`Running ${pkgManager} install...\n`).start();

  // If the package manager is yarn, use yarn's default behavior to install dependencies
  if (pkgManager === "yarn") {
    await execa(pkgManager, [], { cwd: projectDir });
  } else {
    await execa(pkgManager, ["install"], { cwd: projectDir });
  }

  spinner.succeed(chalk.green("Successfully installed dependencies!\n"));
};

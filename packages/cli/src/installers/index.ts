import chalk from "chalk";
import ora from "ora";
import type { PackageManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";
import { generateInstallerMap as generateViteClientInstallerMap, packages as viteClientPacakges } from "./vite:client/index.js";
import { generateInstallerMap as generateViteServerInstallerMap, packages as viteServerPacakges } from "./vite:server/index.js";

export const frameworks = ["vite:client", "vite:server"] as const;

export type Frameworks = typeof frameworks[number];

export const frameworkPackages = {
  "vite:client": viteClientPacakges,
  "vite:server": viteServerPacakges,
} as const satisfies Record<Readonly<Frameworks>, Readonly<Packages>>;

export type Packages = readonly string[];

export type Installer<T extends Frameworks> = (
  opts: InstallerOptions<T>,
) => void;

export interface InstallerOptions<T extends Frameworks> {
  projectDir: string;
  pkgManager: PackageManager;
  framework: T;
  packages: typeof frameworkPackages[T];
  noInstall: boolean;
  projectName?: string;
}

export type InstallerMap<T extends Frameworks> = {
  [pkg in typeof frameworkPackages[T][number]]: {
    inUse: boolean;
    installer: Installer<T>;
  };
};

/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 * TODO: find a better way to seperate this to each installer
 */
export const dependencyVersionMap = {
  // NextAuth.js
  "next-auth": "^4.15.1",
  "@next-auth/prisma-adapter": "^1.0.4",

  // Prisma
  prisma: "^4.5.0",
  "@prisma/client": "^4.5.0",

  // TailwindCSS
  tailwindcss: "^3.2.0",
  autoprefixer: "^10.4.7",
  postcss: "^8.4.14",
  prettier: "^2.7.1",
  "prettier-plugin-tailwindcss": "^0.1.13",

  // tRPC
  "@trpc/client": "10.0.0-rc.4",
  "@trpc/server": "10.0.0-rc.4",
  "@trpc/react-query": "10.0.0-rc.4",
  "@trpc/next": "10.0.0-rc.4",
  "@tanstack/react-query": "^4.10.0",
  superjson: "1.9.1",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;

const getInsallterMap = (opts: InstallerOptions<'vite:client'> | InstallerOptions<'vite:server'>): InstallerMap<'vite:client'> | InstallerMap<'vite:server'> => {
  switch(opts.framework){
    case 'vite:client':
      return generateViteClientInstallerMap(opts.packages)
    case 'vite:server':
      return generateViteServerInstallerMap(opts.packages)
  }
}

export const installPackages:Installer<'vite:client' |'vite:server'> = (opts) => {

  const installerMap = getInsallterMap(opts);

  logger.info("Adding boilerplate...");

  for (const [name, pkgOpts] of Object.entries(installerMap)) {
    if (pkgOpts.inUse) {
      const spinner = ora(`Boilerplating ${name}...`).start();
      pkgOpts.installer(opts);
      spinner.succeed(
        chalk.green(
          `Successfully setup boilerplate for ${chalk.green.bold(name)}`,
        ),
      );
    }
  }

  logger.info("");

}

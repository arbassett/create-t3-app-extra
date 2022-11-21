import type { PackageManager } from "~/utils/getUserPkgManager.js";
import { packages as viteClientPacakges } from "./vite:client/index.js";
import { packages as viteServerPacakges } from "./vite:server/index.js";

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
  packages: typeof frameworkPackages[T];
  noInstall: boolean;
  projectName?: string;
}

export type InstallerMap<T extends Packages> = {
  [pkg in T[number]]: {
    inUse: boolean;
    installer: Installer;
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

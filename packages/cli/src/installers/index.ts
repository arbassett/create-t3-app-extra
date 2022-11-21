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

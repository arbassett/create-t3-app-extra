import { Packages } from "./types.js";
import type { PackageManager } from "~/utils/getUserPkgManager.js";
import { packages as viteClientPacakges } from "./vite:client/index.js";
import { packages as viteServerPacakges } from "./vite:server/index.js";

export const frameworks = ["vite:client", "vite:server"] as const;

export type Frameworks = typeof frameworks[number];

export const frameworkPackages = {
  "vite:client": viteClientPacakges,
  "vite:server": viteServerPacakges,
} as const satisfies Record<Readonly<Frameworks>, Readonly<Packages>>;

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName?: string;
}
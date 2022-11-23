import type { InstallerMap, Packages } from "../index.js";
import { nextAuthInstaller } from "./nextAuth.js";
import { trpcInstaller } from "./trpc.js";
import { tailwindInstaller } from "./tw.js";

export const packages = ["trpc", "nextAuth", "tailwind"] as const satisfies Packages;;
export type ViteClientPackages = typeof packages;

// The order of this does matter. tailwind should allways be first as it does the most edits
export const generateInstallerMap = (
  packages: ViteClientPackages,
): InstallerMap<'vite:client'> => ({
  tailwind: {
    inUse: packages.includes("tailwind"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: tailwindInstaller,
  },
  trpc: {
    inUse: packages.includes("trpc"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: trpcInstaller,
  },
  nextAuth: {
    inUse: packages.includes("nextAuth"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: nextAuthInstaller,
  },
});

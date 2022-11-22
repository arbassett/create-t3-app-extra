import type { InstallerMap, Packages } from "../index.js";
import { trpcInstaller } from "./trpc.js";
import { tailwindInstaller } from "./tw.js";

export const packages = ["trpc", "nextAuth", "tailwind"] as const satisfies Packages;;
export type ViteClientPackages = typeof packages;

export const generateInstallerMap = (
  packages: ViteClientPackages,
): InstallerMap<'vite:client'> => ({
  nextAuth: {
    inUse: packages.includes("nextAuth"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: () => {},
  },
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
});

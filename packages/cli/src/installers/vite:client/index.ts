import { InstallerMap, Packages } from "../types.js";

export const packages = ["trpc" ,"nextAuth", "tailwind"] as const satisfies Packages;
export type ViteClientPackages = typeof packages;

export const generateInstallerMap = (
  packages: ViteClientPackages,
): InstallerMap<ViteClientPackages> => ({
  nextAuth: {
    inUse: packages.includes("nextAuth"),
  },
  tailwind: {
    inUse: packages.includes("tailwind"),
  },
  trpc: {
    inUse: packages.includes('trpc')
  }
});
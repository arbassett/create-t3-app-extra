import { InstallerMap, Packages } from "../types.js";
import { packages as viteClientPacakges } from "../vite:client/index.js";

export const packages = [...viteClientPacakges, "prisma"] as const satisfies Packages;;
export type ViteServerPackages = typeof packages;

export const generateInstallerMap = (
  packages: ViteServerPackages,
): InstallerMap<ViteServerPackages> => ({
  prisma: {
    inUse: packages.includes("prisma"),
  },
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
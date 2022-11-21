import type { InstallerMap, Packages } from "../index.js";
import { packages as viteClientPacakges } from "../vite:client/index.js";

export const packages = [...viteClientPacakges, "prisma"] as const satisfies Packages;;
export type ViteServerPackages = typeof packages;

export const generateInstallerMap = (
  packages: ViteServerPackages,
): InstallerMap<ViteServerPackages> => ({
  prisma: {
    inUse: packages.includes("prisma"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: () => {},
  },
  nextAuth: {
    inUse: packages.includes("nextAuth"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: () => {},
  },
  tailwind: {
    inUse: packages.includes("tailwind"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: () => {},
  },
  trpc: {
    inUse: packages.includes("trpc"),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    installer: () => {},
  },
});

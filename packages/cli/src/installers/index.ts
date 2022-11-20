import { Packages } from "./types";
import { packages as viteClientPacakges} from './vite:client'
import { packages as viteServerPacakges } from "./vite:server";

export const frameworks = ["vite:client", "vite:server"] as const;

export type Frameworks = typeof frameworks[number];

export const frameworkPackages = {
 "vite:client" : viteClientPacakges,
 "vite:server" : viteServerPacakges
} as const satisfies Record<Readonly<Frameworks>, Readonly<Packages>>


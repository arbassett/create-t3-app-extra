import { Packages } from "../types";
import {packages as viteClientPacakges} from '../vite:client'

export const packages = [...viteClientPacakges, 'prisma'] as const satisfies Packages;

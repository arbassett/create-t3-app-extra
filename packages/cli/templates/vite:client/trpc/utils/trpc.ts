// utils/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
// TODO (createt3-app-extra TRPC): import your trpc router from your api server
import type { AppRouter } from "../path/to/router.ts";
import { env } from "../env/client.mjs";

export const getBaseUrl = () => {
  if (env.VITE_API_URL) return env.VITE_API_URL;
  return ""; // browser should use relative url
};

export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

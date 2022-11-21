import { createReactRouter, createRouteConfig } from "@tanstack/react-router";
import indexRoute from "./routes";

const routeConfig = createRouteConfig().addChildren([indexRoute]);

export const router = createReactRouter({
  routeConfig,
});

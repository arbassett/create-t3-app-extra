import { Outlet, RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

export const App = () => (
  <RouterProvider router={router}>
    <Outlet />
  </RouterProvider>
);

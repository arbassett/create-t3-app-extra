import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles/globals.css"

const App = () => (
  <RouterProvider router={router}>
    <Outlet />
  </RouterProvider>
);

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

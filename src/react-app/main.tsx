import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./AppRouter.tsx";
import { TRPCProvider } from "./providers.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TRPCProvider>
      
      <AppRouter />
    </TRPCProvider>
  </StrictMode>,
);

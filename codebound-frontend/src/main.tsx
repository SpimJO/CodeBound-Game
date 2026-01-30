import "./index.css"
import { StrictMode } from 'react'
import { routerTree } from './routes/_root';
import { createRoot } from 'react-dom/client'
import TanstackProvider from './contexts/TanstackProvider';
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster } from 'sonner';

const router = createRouter({ routeTree: routerTree });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" theme="dark" richColors closeButton />
    </TanstackProvider>
  </StrictMode>,
)

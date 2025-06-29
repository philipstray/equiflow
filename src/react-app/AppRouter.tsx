/**
 * Main CRM Application Component
 * Uses TanStack Router for navigation and layout
 */

import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

function App() {
  return <RouterProvider router={router} />;
}

export default App;

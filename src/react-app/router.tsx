/**
 * TanStack Router Configuration
 * Defines all routes for the CRM application
 */

import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ContactsList from './pages/ContactsList';
import ContactForm from './components/forms/ContactForm';
import { CreateContactInput } from '../lib/schemas';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <DashboardLayout />,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

// Contacts routes
const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contacts',
  component: ContactsList,
});

const newContactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contacts/new',
  component: () => (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-oklch(0.15 0.1 240)">Add New Contact</h1>
        <p className="text-oklch(0.5 0.08 240)">Create a new contact in your CRM</p>
      </div>
      <ContactForm
        onSubmit={async (data: CreateContactInput) => {
          // TODO: Implement with tRPC mutation
          console.log('Creating contact:', data);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Navigate back to contacts list
          window.location.href = '/contacts';
        }}
      />
    </div>
  ),
});

// Placeholder routes for other sections
const companiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies',
  component: () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🏢</div>
      <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240) mb-2">Companies</h2>
      <p className="text-oklch(0.5 0.08 240)">Company management coming soon...</p>
    </div>
  ),
});

const dealsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deals',
  component: () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">💼</div>
      <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240) mb-2">Deals Pipeline</h2>
      <p className="text-oklch(0.5 0.08 240)">Deal management coming soon...</p>
    </div>
  ),
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📦</div>
      <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240) mb-2">Products</h2>
      <p className="text-oklch(0.5 0.08 240)">Product catalog coming soon...</p>
    </div>
  ),
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🛍️</div>
      <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240) mb-2">Orders</h2>
      <p className="text-oklch(0.5 0.08 240)">Order management coming soon...</p>
    </div>
  ),
});

const meetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetings',
  component: () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📅</div>
      <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240) mb-2">Meetings</h2>
      <p className="text-oklch(0.5 0.08 240)">Meeting calendar coming soon...</p>
    </div>
  ),
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">💳</div>
      <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240) mb-2">Transactions</h2>
      <p className="text-oklch(0.5 0.08 240)">Transaction history coming soon...</p>
    </div>
  ),
});

// Index route (redirect to dashboard)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    // Redirect to dashboard
    window.location.href = '/dashboard';
    return <div>Redirecting to dashboard...</div>;
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  contactsRoute,
  newContactRoute,
  companiesRoute,
  dealsRoute,
  productsRoute,
  ordersRoute,
  meetingsRoute,
  transactionsRoute,
]);

// Create router
export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

/**
 * Example TanStack Router setup for Equiflow CRM
 * Demonstrates integration with existing tRPC + React Query stack
 */

import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { QueryClient } from '@tanstack/react-query';
import { trpc } from './trpc';

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorBoundary,
});

// Dashboard route with authentication
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
  beforeLoad: ({ context }) => {
    // Check authentication
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

// Contacts route with data loading
const contactsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/contacts',
  component: ContactsPage,
  validateSearch: z.object({
    page: z.number().default(1),
    limit: z.number().default(25),
    search: z.string().optional(),
    status: z.enum(['active', 'archived']).default('active'),
  }),
  loader: async ({ context, search }) => {
    // Use existing tRPC setup with React Query
    return context.queryClient.ensureQueryData({
      queryKey: ['contacts', search],
      queryFn: () => context.trpc.contacts.list.query(search),
    });
  },
});

// Contact detail route with dynamic parameter
const contactDetailRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/contacts/$contactId',
  component: ContactDetailPage,
  parseParams: ({ contactId }) => ({
    contactId: contactId as ContactId, // Use your branded types
  }),
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ['contact', params.contactId],
      queryFn: () => context.trpc.contacts.get.query({ id: params.contactId }),
    });
  },
});

// Activities route with complex search params
const activitiesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/activities',
  component: ActivitiesPage,
  validateSearch: z.object({
    contactId: z.string().optional(),
    type: z.enum(['email', 'call', 'meeting', 'note']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.number().default(1),
    sortBy: z.enum(['created_at', 'occurred_at']).default('occurred_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  loader: async ({ context, search }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ['activities', search],
      queryFn: () => context.trpc.activities.list.query(search),
    });
  },
});

// Route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute.addChildren([
    contactsRoute,
    contactDetailRoute,
    activitiesRoute,
  ]),
]);

// Router with context
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be set by provider
    queryClient: undefined!,
    trpc: undefined!,
    tenantId: undefined! as string,
  },
});

// Router provider with context
export function RouterProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const auth = useAuth(); // Your auth context
  const tenantId = useTenantId(); // Your tenant context
  
  return (
    <TanStackRouterProvider
      router={router}
      context={{
        auth,
        queryClient,
        trpc,
        tenantId,
      }}
    >
      {children}
    </TanStackRouterProvider>
  );
}

// Example component with router integration
function ContactsPage() {
  const search = useSearch({ from: contactsRoute.id });
  const navigate = useNavigate({ from: contactsRoute.id });
  const { data: contacts } = useLoaderData({ from: contactsRoute.id });

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<typeof search>) => {
    navigate({
      search: { ...search, ...newFilters, page: 1 }, // Reset to page 1
      replace: true, // Don't add to history
    });
  };

  return (
    <div>
      <ContactFilters
        search={search}
        onFiltersChange={updateFilters}
      />
      <ContactTable
        contacts={contacts}
        pagination={{
          page: search.page,
          limit: search.limit,
          onPageChange: (page) => updateFilters({ page }),
        }}
      />
    </div>
  );
}

// Example with neverthrow integration in loader
const contactWithErrorHandling = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/contacts/$contactId/edit',
  component: EditContactPage,
  loader: async ({ context, params }) => {
    const result = await context.trpc.contacts.get.query({ id: params.contactId });
    
    // Use neverthrow pattern in router
    if (result.isErr()) {
      switch (result.error.type) {
        case 'NOT_FOUND':
          throw notFound();
        case 'UNAUTHORIZED':
          throw redirect({ to: '/login' });
        default:
          throw new Error('Failed to load contact');
      }
    }
    
    return result.value;
  },
});

// Type-safe navigation helper
export const useTypedNavigate = () => {
  const navigate = useNavigate();
  
  return {
    toContacts: (search?: { page?: number; search?: string }) =>
      navigate({ to: '/dashboard/contacts', search }),
    toContact: (contactId: ContactId) =>
      navigate({ to: '/dashboard/contacts/$contactId', params: { contactId } }),
    toActivities: (contactId?: ContactId) =>
      navigate({ 
        to: '/dashboard/activities', 
        search: contactId ? { contactId } : undefined 
      }),
  };
};

/**
 * Benefits of this setup:
 * 
 * 1. Type Safety:
 *    - Routes, params, and search are fully typed
 *    - Compile-time errors for invalid navigation
 *    - Auto-complete for route parameters
 * 
 * 2. Data Loading:
 *    - Integrates with your existing React Query setup
 *    - Leverages tRPC for type-safe API calls
 *    - Proper loading states and error handling
 * 
 * 3. URL State:
 *    - Search params automatically validated with Zod
 *    - Bidirectional sync between URL and component state
 *    - Deep linking works out of the box
 * 
 * 4. Performance:
 *    - Code splitting by route
 *    - Prefetching on hover
 *    - Optimistic navigation
 * 
 * 5. Error Handling:
 *    - Works with your neverthrow patterns
 *    - Route-level error boundaries
 *    - Proper error states
 */

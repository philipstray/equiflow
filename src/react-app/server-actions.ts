import { trpc } from './trpc';

/**
 * Enhanced hooks that provide server-action-like experience
 */

// Query hooks (for reading data)
export const useGetName = () => {
  const query = trpc.getName.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  return {
    ...query,
    name: query.data?.name,
    timestamp: query.data?.timestamp,
  };
};

export const useGetUsers = (params?: { limit?: number; offset?: number; search?: string }) => {
  return trpc.getUsers.useQuery(params || {}, {
    placeholderData: (previousData) => previousData, // TanStack Query v5 syntax
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Health check hook
export const useHealthCheck = () => {
  return trpc.healthCheck.useQuery(undefined, {
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Mutation hooks (for server actions)
export const useCreateUser = () => {
  const utils = trpc.useUtils();
  
  return trpc.createUser.useMutation({
    onSuccess: (newUser) => {
      // Optimistic updates
      utils.getUsers.setData({}, (old) => {
        if (!old) return { users: [newUser], total: 1, hasMore: false };
        
        return {
          users: [newUser, ...old.users],
          total: old.total + 1,
          hasMore: old.hasMore,
        };
      });
      
      // Invalidate and refetch
      utils.getUsers.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create user:', error.message);
    },
  });
};

/**
 * Server-action-like utilities for imperative calls
 * Note: This is a hook and must be called at the component level
 */
export const useServerActions = () => {
  const utils = trpc.useUtils();
  
  return {
    /**
     * Get name (imperative style)
     */
    async getName() {
      return await utils.getName.fetch();
    },

    /**
     * Get users with parameters
     */
    async getUsers(params: { limit?: number; offset?: number; search?: string } = {}) {
      return await utils.getUsers.fetch(params);
    },

    /**
     * Check system health
     */
    async healthCheck() {
      return await utils.healthCheck.fetch();
    },
  };
};

/**
 * @deprecated Use useServerActions instead
 * This is kept for backward compatibility but will be removed
 */
export const createServerActions = useServerActions;

/**
 * Form action helpers (like Next.js form actions)
 */
export const useFormActions = () => {
  const createUserMutation = useCreateUser();
  
  const createUserAction = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    
    if (!name || !email) {
      throw new Error('Name and email are required');
    }
    
    return await createUserMutation.mutateAsync({ name, email, age });
  };
  
  return {
    createUserAction,
    isPending: createUserMutation.isPending,
    error: createUserMutation.error,
    data: createUserMutation.data,
  };
};

/**
 * Example usage:
 * 
 * // Enhanced query hook with caching and error handling
 * const { name, isLoading, error, timestamp } = useGetName();
 * 
 * // Health monitoring
 * const { data: health, isLoading: healthLoading } = useHealthCheck();
 * 
 * // Pagination with optimistic updates
 * const { data: users, isLoading } = useGetUsers({ limit: 10, search: "john" });
 * 
 * // Mutation hook with optimistic updates (like server action)
 * const createUser = useCreateUser();
 * await createUser.mutateAsync({ name: "John", email: "john@example.com" });
 * 
 * // Imperative calls (like Next.js server actions)
 * const actions = useServerActions(); // Hook - call at component level
 * const result = await actions.getName();
 * const healthStatus = await actions.healthCheck();
 * 
 * // Form actions with built-in validation
 * const { createUserAction, isPending, error } = useFormActions();
 * <form action={createUserAction}>
 *   <input name="name" required />
 *   <input name="email" type="email" required />
 *   <button disabled={isPending}>Create User</button>
 * </form>
 */

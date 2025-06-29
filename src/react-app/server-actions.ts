import { trpc } from './trpc';
import { Result, ResultAsync, ok, err } from 'neverthrow';

/**
 * Enhanced hooks that provide server-action-like exp  const mutateWithResult = async (userData: { name: string; email: string; age?: number }): Promise<Result<CreateUserResponse, ClientError>> {rience with neverthrow
 */

// API Response Types
type GetNameResponse = { name: string; timestamp: string };
type CreateUserResponse = { id: string; name: string; email: string; age?: number; createdAt: string };
type GetUsersResponse = { 
  users: Array<{ id: string; name: string; email: string; createdAt: string }>; 
  total: number; 
  hasMore: boolean; 
};
type HealthCheckResponse = { status: string; timestamp: string; version: string; trpc?: string };

// Types for better error handling
type ClientError = 
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'SERVER_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

// Helper to convert tRPC errors to our Result type
const handleTRPCError = (error: unknown): ClientError => {
  const err = error as { data?: { code?: string }; message?: string }; // tRPC error shape
  if (err?.data?.code) {
    switch (err.data.code) {
      case 'BAD_REQUEST':
        return { type: 'VALIDATION_ERROR', message: err.message || 'Validation failed' };
      case 'INTERNAL_SERVER_ERROR':
        return { type: 'SERVER_ERROR', message: err.message || 'Server error' };
      default:
        return { type: 'UNKNOWN_ERROR', message: err.message || 'Unknown error' };
    }
  }
  
  if (err?.message?.includes('fetch')) {
    return { type: 'NETWORK_ERROR', message: 'Network connection failed' };
  }
  
  return { type: 'UNKNOWN_ERROR', message: err?.message || 'Unknown error occurred' };
};

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
 * Result-based server actions (neverthrow integration)
 * These provide explicit error handling without try/catch
 */
export const useResultServerActions = () => {
  const utils = trpc.useUtils();
  
  return {
    /**
     * Get name with Result type
     */
    async getName(): Promise<Result<GetNameResponse, ClientError>> {
      return await ResultAsync.fromPromise(
        utils.getName.fetch(),
        (error) => handleTRPCError(error)
      );
    },

    /**
     * Get users with Result type
     */
    async getUsers(params: { limit?: number; offset?: number; search?: string } = {}): Promise<Result<GetUsersResponse, ClientError>> {
      return await ResultAsync.fromPromise(
        utils.getUsers.fetch(params),
        (error) => handleTRPCError(error)
      );
    },

    /**
     * Health check with Result type
     */
    async healthCheck(): Promise<Result<HealthCheckResponse, ClientError>> {
      return await ResultAsync.fromPromise(
        utils.healthCheck.fetch(),
        (error) => handleTRPCError(error)
      );
    },
  };
};

/**
 * Enhanced mutation hook with neverthrow
 */
export const useCreateUserResult = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.createUser.useMutation();
  
  const mutateWithResult = async (userData: { name: string; email: string; age?: number }): Promise<Result<CreateUserResponse, ClientError>> => {
    try {
      const result = await mutation.mutateAsync(userData);
      
      // Optimistic updates on success
      utils.getUsers.setData({}, (old) => {
        if (!old) return { users: [result], total: 1, hasMore: false };
        
        return {
          users: [result, ...old.users],
          total: old.total + 1,
          hasMore: old.hasMore,
        };
      });
      
      // Invalidate and refetch
      utils.getUsers.invalidate();
      
      return ok(result);
    } catch (error) {
      return err(handleTRPCError(error));
    }
  };
  
  return {
    mutateWithResult,
    isPending: mutation.isPending,
    error: mutation.error ? handleTRPCError(mutation.error) : null,
    data: mutation.data,
    reset: mutation.reset,
  };
};

/**
 * Form actions with neverthrow (no more try/catch!)
 */
export const useResultFormActions = () => {
  const createUserResult = useCreateUserResult();
  
  const createUserAction = async (formData: FormData): Promise<Result<CreateUserResponse, ClientError>> => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    
    // Validate with neverthrow
    const validateFormData = (): Result<{ name: string; email: string; age?: number }, ClientError> => {
      if (!name || !email) {
        return err({ type: 'VALIDATION_ERROR', message: 'Name and email are required' });
      }
      
      if (age !== undefined && (isNaN(age) || age < 0 || age > 150)) {
        return err({ type: 'VALIDATION_ERROR', message: 'Age must be a valid number between 0 and 150' });
      }
      
      return ok({ name, email, age });
    };
    
    // Chain operations without try/catch - fixed approach
    const validationResult = validateFormData();
    if (validationResult.isErr()) {
      return err(validationResult.error); // Return just the error, not the whole validation result
    }
    
    return await createUserResult.mutateWithResult(validationResult.value);
  };
  
  return {
    createUserAction,
    isPending: createUserResult.isPending,
    error: createUserResult.error,
    data: createUserResult.data,
  };
};

/**
 * Legacy server actions (keeping for backward compatibility)
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
 * @deprecated Use useResultServerActions instead
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
 * // TRADITIONAL APPROACH (with try/catch):
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
 * 
 * 
 * // NEVERTHROW APPROACH (explicit error handling, no try/catch):
 * 
 * // Result-based server actions with explicit error types
 * const actions = useResultServerActions();
 * const nameResult = await actions.getName();
 * 
 * if (nameResult.isOk()) {
 *   console.log('Success:', nameResult.value.name);
 * } else {
 *   console.error('Error type:', nameResult.error.type);
 *   console.error('Error message:', nameResult.error.message);
 * }
 * 
 * // Chaining operations without try/catch
 * const usersResult = await actions.getUsers({ limit: 10 })
 *   .then(result => result.map(data => data.users.filter(u => u.name.includes('John'))));
 * 
 * // Form actions with Result types
 * const { createUserAction, isPending, error } = useResultFormActions();
 * const handleSubmit = async (formData: FormData) => {
 *   const result = await createUserAction(formData);
 *   
 *   result.match(
 *     (user) => console.log('User created:', user),
 *     (error) => {
 *       switch (error.type) {
 *         case 'VALIDATION_ERROR':
 *           setFormError(error.message);
 *           break;
 *         case 'NETWORK_ERROR':
 *           showNetworkErrorToast();
 *           break;
 *         case 'SERVER_ERROR':
 *           showServerErrorToast();
 *           break;
 *       }
 *     }
 *   );
 * };
 * 
 * // Mutation with Result type
 * const createUserResult = useCreateUserResult();
 * const handleCreateUser = async () => {
 *   const result = await createUserResult.mutateWithResult({ 
 *     name: "Jane", 
 *     email: "jane@example.com" 
 *   });
 *   
 *   if (result.isErr()) {
 *     // Handle error based on type
 *     if (result.error.type === 'VALIDATION_ERROR') {
 *       // Show validation error
 *     }
 *   } else {
 *     // Success - no need for try/catch!
 *     console.log('User created:', result.value);
 *   }
 * };
 */

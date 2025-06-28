import { trpc } from './trpc';

/**
 * Hook-based utilities that feel similar to Next.js server actions
 * These provide a cleaner API over tRPC
 */

// For queries (like reading data)
export const useGetName = () => trpc.getName.useQuery();

// For mutations (like creating/updating data)
export const useCreateUser = () => trpc.createUser.useMutation();

/**
 * Example of how to use these in your components:
 * 
 * const { data: nameData, isLoading } = useGetName();
 * const createUser = useCreateUser();
 * 
 * const handleCreateUser = async () => {
 *   try {
 *     const result = await createUser.mutateAsync({
 *       name: "John",
 *       email: "john@example.com"
 *     });
 *     console.log("User created:", result);
 *   } catch (error) {
 *     console.error("Error:", error);
 *   }
 * };
 */

import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Initialize tRPC
const t = initTRPC.create();

// Create the main router
export const appRouter = t.router({
  getName: t.procedure
    .query(async () => {
      // This is where you'd use your RPC methods or bindings
      return { name: "Equiflow Worker via tRPC" };
    }),
  
  // Example mutation
  createUser: t.procedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      // Here you could use your Worker bindings like D1, KV, etc.
      return {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        createdAt: new Date().toISOString(),
      };
    }),
});

export type AppRouter = typeof appRouter;

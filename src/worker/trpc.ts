import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

// Import the DataService type (we'll import the class at runtime to avoid circular dependencies)
type DataService = {
  getName(): Promise<{ name: string }>;
  createUser(userData: { name: string; email: string; age?: number }): Promise<{
    id: string;
    name: string;
    email: string;
    age?: number;
    createdAt: string;
  }>;
  getUsers(options?: { limit?: number; offset?: number; search?: string }): Promise<{
    users: Array<{ id: string; name: string; email: string; createdAt: string }>;
    total: number;
    hasMore: boolean;
  }>;
  healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
  }>;
};

interface Env {
  DATA_SERVICE?: DataService;
  // Add other bindings here as needed
  // DB?: D1Database;
  // MY_KV?: KVNamespace;
  // MY_BUCKET?: R2Bucket;
}
// Define context type
interface Context {
  env?: Env;
  request?: Request;
}


// Initialize tRPC with context and error formatting
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        httpStatus: error.cause instanceof Error ? 500 : 400,
      },
    };
  },
});

// Create reusable middleware
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  console.log(`${type} ${path} took ${durationMs}ms`, {
    ok: result.ok,
  });
  
  return result;
});

// Base procedure with logging
const baseProcedure = t.procedure.use(loggerMiddleware);

// Create the main router with enhanced procedures
export const appRouter = t.router({
  // Enhanced getName with caching and error handling
  getName: baseProcedure
    .query(async ({ ctx }) => {
      try {
        // Access bindings from context if needed
        const result = await ctx.env?.DATA_SERVICE?.getName();
        
        // Simulate potential errors for demo
        if (!result) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error initializing DataService',
          });
        }

        const name = result.name;
        
        return { 
          name: name,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error in getName:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get name',
          cause: error,
        });
      }
    }),
  
  // Enhanced createUser with validation and error handling
  createUser: baseProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      email: z.string().email('Invalid email format'),
      age: z.number().int().min(0).max(150).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Here you could use your Worker bindings like D1, KV, etc.
        // const db = ctx.env?.DB;
        // const result = await db.prepare('INSERT INTO users...').bind(input.name, input.email).run();
        console.log(ctx.env)
        // Simulate validation error
        if (input.email.includes('blocked')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This email domain is blocked',
          });
        }
        
        const user = {
          id: crypto.randomUUID(),
          name: input.name,
          email: input.email,
          age: input.age,
          createdAt: new Date().toISOString(),
        };
        
        console.log('Created user:', user);
        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error creating user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
          cause: error,
        });
      }
    }),

  // Batch operations example
  getUsers: baseProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Try to use the RPC method first, fall back to direct implementation
        if (ctx.env?.DATA_SERVICE?.getUsers) {
          return await ctx.env.DATA_SERVICE.getUsers(input);
        }
        
        // Fallback implementation
        const allUsers = Array.from({ length: 25 }, (_, i) => ({
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }));
        
        let filteredUsers = allUsers;
        if (input.search) {
          filteredUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(input.search!.toLowerCase()) ||
            user.email.toLowerCase().includes(input.search!.toLowerCase())
          );
        }
        
        const users = filteredUsers.slice(input.offset, input.offset + input.limit);
        
        return {
          users,
          total: filteredUsers.length,
          hasMore: input.offset + input.limit < filteredUsers.length,
        };
      } catch (error) {
        console.error('Error in getUsers:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get users',
          cause: error,
        });
      }
    }),

  // Health check endpoint
  healthCheck: baseProcedure
    .query(async ({ ctx }) => {
      try {
        // Try to use the RPC method first
        if (ctx.env?.DATA_SERVICE?.healthCheck) {
          return await ctx.env.DATA_SERVICE.healthCheck();
        }
        
        // Fallback implementation
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          trpc: 'enabled',
        };
      } catch (error) {
        console.error('Error in healthCheck:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Health check failed',
          cause: error,
        });
      }
    }),
});

export type AppRouter = typeof appRouter;

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Result, ResultAsync, ok, err } from 'neverthrow';

// Define our error types for better type safety
type AppError = 
  | { type: 'VALIDATION_ERROR'; message: string; field?: string }
  | { type: 'SERVICE_UNAVAILABLE'; message: string }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'BLOCKED_EMAIL'; message: string }
  | { type: 'INTERNAL_ERROR'; message: string };

// Helper function to convert our Result to tRPC errors
const resultToTRPC = <T>(result: Result<T, AppError>): T => {
  if (result.isErr()) {
    const error = result.error;
    switch (error.type) {
      case 'VALIDATION_ERROR':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      case 'BLOCKED_EMAIL':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      case 'NOT_FOUND':
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      case 'SERVICE_UNAVAILABLE':
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      case 'INTERNAL_ERROR':
      default:
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
    }
  }
  return result.value;
};

interface Env {
  // Add other Cloudflare bindings here as needed
  // DB?: D1Database;
  // MY_KV?: KVNamespace;
  // MY_BUCKET?: R2Bucket;
  [key: string]: unknown;
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
  // Enhanced getName with direct implementation
  getName: baseProcedure
    .query(async () => {
      const result = ResultAsync.fromSafePromise(Promise.resolve({
        name: 'Cloudflare Worker with tRPC',
        timestamp: new Date().toISOString(),
      }));

      return resultToTRPC(await result);
    }),
  
  // Enhanced createUser with validation and error handling
  createUser: baseProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      email: z.string().email('Invalid email format'),
      age: z.number().int().min(0).max(150).optional(),
    }))
    .mutation(async ({ input }) => {
      // Pre-validation using neverthrow
      const validateInput = (): Result<typeof input, AppError> => {
        if (input.email.includes('blocked')) {
          return err({ type: 'BLOCKED_EMAIL', message: 'This email domain is blocked' });
        }
        return ok(input);
      };

      const result = ResultAsync.fromSafePromise(
        (async () => {
          const validationResult = validateInput();
          if (validationResult.isErr()) {
            throw validationResult.error;
          }
          
          const validInput = validationResult.value;
          
          // Simulate database operation
          const user = {
            id: crypto.randomUUID(),
            name: validInput.name,
            email: validInput.email,
            age: validInput.age,
            createdAt: new Date().toISOString(),
          };
          
          console.log('Created user:', user);
          return user;
        })()
      ).mapErr((error): AppError => {
        if (typeof error === 'object' && error !== null && 'type' in error) {
          return error as AppError;
        }
        return { type: 'INTERNAL_ERROR', message: `Failed to create user: ${error}` };
      });

      return resultToTRPC(await result);
    }),

  // Batch operations example
  getUsers: baseProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Direct implementation without service binding
      const result = ResultAsync.fromSafePromise((async () => {
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
      })());

      return resultToTRPC(await result);
    }),

  // Health check endpoint
  healthCheck: baseProcedure
    .query(async () => {
      // Direct implementation
      const result = ResultAsync.fromSafePromise(Promise.resolve({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        trpc: 'enabled',
      }));

      return resultToTRPC(await result);
    }),
});

export type AppRouter = typeof appRouter;

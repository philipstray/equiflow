import { WorkerEntrypoint } from "cloudflare:workers";
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc';
import { Result, ok, err } from 'neverthrow';

// Types for compatibility with tRPC router
type AppError = 
  | { type: 'VALIDATION_ERROR'; message: string; field?: string }
  | { type: 'SERVICE_UNAVAILABLE'; message: string }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'BLOCKED_EMAIL'; message: string }
  | { type: 'INTERNAL_ERROR'; message: string };

interface Env {
  // Add other bindings here as needed when you have them
  // Example bindings (commented out):
  // DB?: D1Database;
  // MY_KV?: KVNamespace;  
  // MY_BUCKET?: R2Bucket;
  [key: string]: unknown;
}

export default class DataService extends WorkerEntrypoint<Env> {
  /**
   * Handle HTTP requests and route them to tRPC or RPC methods
   * @param request The incoming request
   * @returns A Response object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS for development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle tRPC requests - this is the main entry point for your React app
    if (url.pathname.startsWith('/trpc')) {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: () => ({ 
          env: this.env, 
          request 
        }),
        responseMeta() {
          return { headers: corsHeaders };
        },
      });
    }

    // Keep existing HTTP endpoints for backward compatibility or direct access
    if (url.pathname === '/api/name') {
      const result = await this.getName();
      
      if (result.isOk()) {
        return new Response(JSON.stringify(result.value), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } else {
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Default response
    return new Response("DataService is ready - tRPC available at /trpc", { 
      headers: corsHeaders 
    });
  }

  /**
   * RPC method: Fetches a name from the service
   * This can be called directly via service bindings or through tRPC
   * @returns A promise that resolves to a Result containing GetNameResponse or AppError
   */
  async getName(): Promise<Result<{ name: string }, AppError>> {
    try {
      // You can access Worker bindings here through this.env
      // Example: await this.env.DB.prepare("SELECT name FROM settings").first();
      
      // Simulate some async work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return ok({ 
        name: "Equiflow Worker with tRPC Support" 
      });
    } catch (error) {
      return err({ 
        type: 'INTERNAL_ERROR', 
        message: `Failed to get name: ${error}` 
      });
    }
  }

  /**
   * RPC method: Create a user
   * @param userData User data to create
   * @returns Promise with Result containing created user data or error
   */
  async createUser(userData: { name: string; email: string; age?: number }): Promise<Result<{
    id: string;
    name: string;
    email: string;
    age?: number;
    createdAt: string;
  }, AppError>> {
    try {
      // Access Worker bindings for database operations
      // Example: await this.env.DB.prepare("INSERT INTO users (name, email, age) VALUES (?, ?, ?)").bind(userData.name, userData.email, userData.age).run();
      
      console.log('Creating user via RPC:', userData);
      
      return ok({
        id: crypto.randomUUID(),
        ...userData,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      return err({ 
        type: 'INTERNAL_ERROR', 
        message: `Failed to create user: ${error}` 
      });
    }
  }

  /**
   * RPC method: Get users with pagination
   * @param options Query options for filtering and pagination
   * @returns Promise with Result containing user list and metadata or error
   */
  async getUsers(options: { limit?: number; offset?: number; search?: string } = {}): Promise<Result<{
    users: Array<{ id: string; name: string; email: string; createdAt: string }>;
    total: number;
    hasMore: boolean;
  }, AppError>> {
    try {
      const { limit = 10, offset = 0, search } = options;
      
      // This is where you'd query your database
      // Example: const result = await this.env.DB.prepare("SELECT * FROM users WHERE name LIKE ? LIMIT ? OFFSET ?").bind(`%${search}%`, limit, offset).all();
      
      // Simulated data for demo
      const allUsers = Array.from({ length: 25 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }));
      
      let filteredUsers = allUsers;
      if (search) {
        filteredUsers = allUsers.filter(user => 
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const users = filteredUsers.slice(offset, offset + limit);
      
      return ok({
        users,
        total: filteredUsers.length,
        hasMore: offset + limit < filteredUsers.length,
      });
    } catch (error) {
      return err({ 
        type: 'INTERNAL_ERROR', 
        message: `Failed to get users: ${error}` 
      });
    }
  }

  /**
   * RPC method: Health check
   * @returns Promise with Result containing health status or error
   */
  async healthCheck(): Promise<Result<{
    status: string;
    timestamp: string;
    version: string;
  }, AppError>> {
    try {
      return ok({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    } catch (error) {
      return err({ 
        type: 'INTERNAL_ERROR', 
        message: `Health check failed: ${error}` 
      });
    }
  }
}

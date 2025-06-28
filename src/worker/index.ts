import { WorkerEntrypoint } from "cloudflare:workers";
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc';

interface GetNameResponse {
  name: string;
}

interface Env {
  DATA_SERVICE?: DataService;
  // Add other bindings here as needed
  // DB?: D1Database;
  // MY_KV?: KVNamespace;
  // MY_BUCKET?: R2Bucket;
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
          env: { 
            ...this.env,
            DATA_SERVICE: this, // Pass this worker instance for RPC calls
          }, 
          request 
        }),
        responseMeta() {
          return { headers: corsHeaders };
        },
      });
    }

    // Keep existing HTTP endpoints for backward compatibility or direct access
    if (url.pathname === '/api/name') {
      try {
        const result = await this.getName();
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('Error in /api/name:', error);
        return new Response(JSON.stringify({ error: 'Failed to get name' }), {
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
   * @returns A promise that resolves to a GetNameResponse object containing a name.
   */
  async getName(): Promise<GetNameResponse> {
    // You can access Worker bindings here through this.env
    // Example: await this.env.DB.prepare("SELECT name FROM settings").first();
    
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { 
      name: "Equiflow Worker with tRPC Support" 
    };
  }

  /**
   * RPC method: Create a user
   * @param userData User data to create
   * @returns Promise with created user data
   */
  async createUser(userData: { name: string; email: string; age?: number }) {
    // Access Worker bindings for database operations
    // Example: await this.env.DB.prepare("INSERT INTO users (name, email, age) VALUES (?, ?, ?)").bind(userData.name, userData.email, userData.age).run();
    
    console.log('Creating user via RPC:', userData);
    
    return {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * RPC method: Get users with pagination
   * @param options Query options for filtering and pagination
   * @returns Promise with user list and metadata
   */
  async getUsers(options: { limit?: number; offset?: number; search?: string } = {}) {
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
    
    return {
      users,
      total: filteredUsers.length,
      hasMore: offset + limit < filteredUsers.length,
    };
  }

  /**
   * RPC method: Health check
   * @returns Promise with health status
   */
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

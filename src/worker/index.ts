/*
import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Fartolomeo" }));

export default app;
*/

import { WorkerEntrypoint } from "cloudflare:workers";
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc';

interface GetNameResponse {
  name: string;
}

export default class DataService extends WorkerEntrypoint {
  /**
   * Handle HTTP requests and route them to RPC methods
   * @param request The incoming request
   * @param env The Worker environment with bindings
   * @returns A Response object
   */
  async fetch(request: Request, env?: unknown): Promise<Response> {
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

    // Handle tRPC requests
    if (url.pathname.startsWith('/trpc')) {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: () => ({ env }), // Pass env to tRPC context
        responseMeta() {
          return { headers: corsHeaders };
        },
      });
    }

    // Route API requests (keep existing endpoint for backward compatibility)
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
    return new Response("DataService is ready", { headers: corsHeaders });
  }
  /**
   * Fetches a name from the service.
   * @returns A promise that resolves to a GetNameResponse object containing a name.
   */
  async getName(): Promise<GetNameResponse> {
    // Simulate a network request
    return { name: "Equiflow Worker" }
  }
}

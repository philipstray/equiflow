/*
import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Fartolomeo" }));

export default app;
*/

import { WorkerEntrypoint } from "cloudflare:workers";


interface GetNameResponse {
  name: string;
}

export default class DataService extends WorkerEntrypoint {
  /**
   * 
   * @returns A Response object that indicates the service is ready.
   */
  async fetch(): Promise<Response> {
    // This method is required by the WorkerEntrypoint interface
    return new Response("DataService is ready");
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

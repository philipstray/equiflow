import DataService from "../worker";

interface Env {
  DATA_SERVICE: DataService;
}

export async function fetchName(): Promise<{ name: string }> {
  // This function is used to fetch a name from the DataService
  const response = await (process.env as unknown as Env).DATA_SERVICE.getName();
  return response;
}
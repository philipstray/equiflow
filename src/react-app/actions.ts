export async function fetchName(): Promise<{ name: string }> {
  // Make an HTTP request to the Worker's API endpoint
  const response = await fetch('/api/name', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as { name: string };
  return data;
}
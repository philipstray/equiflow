// src/App.tsx

import { useState } from "react";
import "./App.css";
import { trpc } from "./trpc";

function App() {
  const [count, setCount] = useState(0);
  
  // This feels just like Next.js server actions!
  const { data: nameData, isLoading, refetch } = trpc.getName.useQuery();
  
  // Example mutation (like a server action)
  const createUserMutation = trpc.createUser.useMutation();

  const handleCreateUser = async () => {
    try {
      const result = await createUserMutation.mutateAsync({
        name: "John Doe",
        email: "john@example.com",
      });
      console.log("User created:", result);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  return (
    <>
      <div>
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label="increment"
        >
          count is {count}
        </button>
        <button
          onClick={() => setCount(() => 0)}
          aria-label="reset"
        >
          reset count
        </button>
      </div>
      <div className="card">
        <button
          onClick={() => refetch()}
          aria-label="get name"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : `Name from API is: ${nameData?.name || 'unknown'}`}
        </button>
      </div>
      <div className="card">
        <button
          onClick={handleCreateUser}
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? "Creating..." : "Create User"}
        </button>
        {createUserMutation.data && (
          <p>Created user: {createUserMutation.data.name}</p>
        )}
      </div>
    </>
  );
}

export default App;

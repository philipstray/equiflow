// src/App.tsx

import { useState } from "react";
import "./App.css";
import { useGetName, useCreateUser, useGetUsers, useHealthCheck, useServerActions } from "./server-actions";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  
  // Enhanced tRPC hooks (feels like Next.js server actions!)
  const { name: trpcName, isLoading, error, timestamp, refetch: refetchName } = useGetName();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetUsers({ limit: 5 });
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useHealthCheck();
  const createUserMutation = useCreateUser();
  
  // Server actions helper - MUST be called at component level, not in handlers
  const actions = useServerActions();

  const handleCreateUser = async () => {
    try {
      const result = await createUserMutation.mutateAsync({
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      });
      console.log("User created:", result);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleImperativeCall = async () => {
    try {
      const result = await actions.getName();
      console.log("Imperative call result:", result);
    } catch (error) {
      console.error("Imperative call failed:", error);
    }
  };

  return (
    <>
      {/* Health Status Bar */}
      <div style={{ 
        background: health?.status === 'healthy' ? '#d4edda' : '#f8d7da', 
        color: health?.status === 'healthy' ? '#155724' : '#721c24',
        padding: '8px 16px',
        borderRadius: '4px',
        marginBottom: '16px',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          {healthLoading ? '⏳ Checking health...' : 
           health ? `✅ ${health.status} (v${health.version})` : 
           '❌ Health check failed'}
        </span>
        <button 
          onClick={() => refetchHealth()}
          style={{ 
            background: 'transparent', 
            border: '1px solid currentColor', 
            color: 'inherit',
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          disabled={healthLoading}
        >
          {healthLoading ? '...' : 'Refresh'}
        </button>
      </div>

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
        <h3>Enhanced tRPC Query (with caching & error handling)</h3>
        <p>
          {isLoading ? "Loading..." : 
           error ? `Error: ${error.message}` :
           `Name: ${trpcName} (${timestamp})`}
        </p>
        <button 
          onClick={() => refetchName()} 
          style={{ marginTop: '8px', fontSize: '12px' }}
        >
          Refresh Name
        </button>
      </div>

      <div className="card">
        <h3>Imperative tRPC Call</h3>
        <button
          onClick={async () => {
            try {
              const nameData = await actions.getName();
              setName(nameData.name);
            } catch (error) {
              console.error('Failed to fetch name:', error);
              setName('error');
            }
          }}
        >
          Fetch Name with tRPC action (name: {name})
        </button>
      </div>
      
      <div className="card">
        <h3>Mutation with Optimistic Updates</h3>
        <button
          onClick={handleCreateUser}
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? "Creating..." : "Create User"}
        </button>
        {createUserMutation.error && (
          <p style={{ color: 'red' }}>Error: {createUserMutation.error.message}</p>
        )}
        {createUserMutation.data && (
          <p style={{ color: 'green' }}>Created: {createUserMutation.data.name}</p>
        )}
      </div>
      
      <div className="card">
        <h3>Additional Server Actions</h3>
        <button onClick={handleImperativeCall}>
          Log getName Result to Console
        </button>
      </div>

      <div className="card">
        <h3>User List (with Pagination)</h3>
        {usersLoading ? (
          <p>Loading users...</p>
        ) : users ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>Total: {users.total} users</p>
              <button 
                onClick={() => refetchUsers()}
                style={{ fontSize: '12px' }}
                disabled={usersLoading}
              >
                Refresh Users
              </button>
            </div>
            <ul>
              {users.users.map(user => (
                <li key={user.id}>{user.name} - {user.email}</li>
              ))}
            </ul>
            {users.hasMore && <p>Has more users...</p>}
          </div>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </>
  );
}

export default App;

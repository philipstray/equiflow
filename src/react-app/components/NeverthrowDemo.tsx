import React, { useState } from 'react';
import { useResultServerActions, useResultFormActions, useCreateUserResult } from '../server-actions';

/**
 * Demo component showing neverthrow integration
 * Notice: NO try/catch blocks needed!
 */
export const NeverthrowDemo: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const resultActions = useResultServerActions();
  const createUserResult = useCreateUserResult();
  const { createUserAction, isPending } = useResultFormActions();

  // Example 1: Simple query with explicit error handling
  const handleGetName = async () => {
    const result = await resultActions.getName();
    
    // No try/catch needed - explicit success/error handling
    if (result.isOk()) {
      setStatus(`Name: ${result.value.name} (${result.value.timestamp})`);
      setError('');
    } else {
      setError(`${result.error.type}: ${result.error.message}`);
      setStatus('');
    }
  };

  // Example 2: Chaining operations with neverthrow
  const handleGetUsers = async () => {
    const result = await resultActions.getUsers({ limit: 5 })
      .then(usersResult => 
        usersResult.map(data => ({
          ...data,
          users: data.users.slice(0, 3) // Take only first 3 users
        }))
      );
    
    result.match(
      (data) => setStatus(`Found ${data.users.length} users (total: ${data.total})`),
      (error) => setError(`${error.type}: ${error.message}`)
    );
  };

  // Example 3: Mutation with Result type
  const handleCreateUser = async () => {
    const result = await createUserResult.mutateWithResult({
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    });

    if (result.isErr()) {
      // Handle different error types
      switch (result.error.type) {
        case 'VALIDATION_ERROR':
          setError(`Validation failed: ${result.error.message}`);
          break;
        case 'NETWORK_ERROR':
          setError('Network connection failed');
          break;
        case 'SERVER_ERROR':
          setError('Server error occurred');
          break;
        default:
          setError(`Unknown error: ${result.error.message}`);
      }
    } else {
      setStatus(`User created: ${result.value.name} (${result.value.id})`);
      setError('');
    }
  };

  // Example 4: Form submission with neverthrow
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = await createUserAction(formData);
    
    // Pattern matching for clean error handling
    result.match(
      (user) => {
        setStatus(`Form submission successful: ${user.name}`);
        setError('');
        (event.target as HTMLFormElement).reset();
      },
      (error) => {
        setError(`Form error (${error.type}): ${error.message}`);
        setStatus('');
      }
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Neverthrow Integration Demo</h2>
      <p>Notice: No try/catch blocks needed! Explicit error handling with types.</p>
      
      {/* Status and Error Display */}
      {status && (
        <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '10px', borderRadius: '4px' }}>
          ✅ {status}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '10px', borderRadius: '4px' }}>
          ❌ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleGetName} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Get Name (Result)
        </button>
        
        <button onClick={handleGetUsers} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Get Users (Result)
        </button>
        
        <button 
          onClick={handleCreateUser} 
          disabled={createUserResult.isPending}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          {createUserResult.isPending ? 'Creating...' : 'Create User (Result)'}
        </button>
      </div>

      {/* Form Example */}
      <form onSubmit={handleFormSubmit} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <h3>Create User Form (with neverthrow validation)</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name">Name:</label>
          <input 
            type="text" 
            name="name" 
            required 
            style={{ marginLeft: '10px', padding: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            name="email" 
            required 
            style={{ marginLeft: '10px', padding: '4px' }}
            placeholder="Try 'blocked@example.com' to test error handling"
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="age">Age:</label>
          <input 
            type="number" 
            name="age" 
            min="0" 
            max="150" 
            style={{ marginLeft: '10px', padding: '4px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isPending}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isPending ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>

      {/* Code Examples */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Compare Approaches:</h3>
        
        <h4>❌ Traditional (try/catch):</h4>
        <pre style={{ fontSize: '12px', backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
{`try {
  const result = await createUser(userData);
  setStatus('Success: ' + result.name);
} catch (error) {
  // Error type is unknown, need to check manually
  setError('Error: ' + error.message);
}`}
        </pre>
        
        <h4>✅ Neverthrow (explicit):</h4>
        <pre style={{ fontSize: '12px', backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
{`const result = await createUserResult.mutateWithResult(userData);

if (result.isOk()) {
  setStatus('Success: ' + result.value.name);
} else {
  // Error type is known and typed
  switch (result.error.type) {
    case 'VALIDATION_ERROR':
      setError('Validation: ' + result.error.message);
      break;
    case 'NETWORK_ERROR':
      setError('Network issue');
      break;
  }
}`}
        </pre>
      </div>
    </div>
  );
};

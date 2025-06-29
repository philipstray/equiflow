#!/usr/bin/env node

/**
 * Neverthrow Integration Demo
 * 
 * This script demonstrates the key differences between traditional try/catch
 * error handling and neverthrow's explicit Result types.
 */

import { Result, ok, err, ResultAsync } from 'neverthrow';

// Types similar to what we have in the app
type AppError = 
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'SERVER_ERROR'; message: string };

type User = {
  id: string;
  name: string;
  email: string;
  age?: number;
};

console.log('🚀 Neverthrow Integration Demo\n');

/**
 * Traditional approach with try/catch
 */
async function traditionalCreateUser(userData: { name: string; email: string; age?: number }): Promise<User> {
  try {
    // Simulate validation
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }
    
    if (userData.email.includes('blocked')) {
      throw new Error('This email domain is blocked');
    }
    
    // Simulate network call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      age: userData.age,
    };
  } catch (error: any) {
    // Error type is unknown - need manual checking
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Neverthrow approach with explicit Result types
 */
function neverthrowCreateUser(userData: { name: string; email: string; age?: number }): ResultAsync<User, AppError> {
  // Validation step
  const validateInput = (): Result<typeof userData, AppError> => {
    if (!userData.name || !userData.email) {
      return err({ type: 'VALIDATION_ERROR', message: 'Name and email are required' });
    }
    
    if (userData.email.includes('blocked')) {
      return err({ type: 'VALIDATION_ERROR', message: 'This email domain is blocked' });
    }
    
    return ok(userData);
  };

  // Chain operations without try/catch
  return ResultAsync.fromSafePromise(
    (async () => {
      const validationResult = validateInput();
      if (validationResult.isErr()) {
        throw validationResult.error;
      }
      
      const validData = validationResult.value;
      
      // Simulate network call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name: validData.name,
        email: validData.email,
        age: validData.age,
      };
    })()
  ).mapErr((error): AppError => {
    if (typeof error === 'object' && error !== null && 'type' in error) {
      return error as AppError;
    }
    return { type: 'SERVER_ERROR', message: `Unexpected error: ${error}` };
  });
}

/**
 * Demo: Traditional error handling
 */
async function demoTraditional() {
  console.log('=== Traditional Try/Catch Approach ===\n');

  // Success case
  try {
    const user = await traditionalCreateUser({ name: 'John Doe', email: 'john@example.com' });
    console.log('✅ Success:', user);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }

  // Error case
  try {
    const user = await traditionalCreateUser({ name: 'Jane', email: 'jane@blocked.com' });
    console.log('✅ Success:', user);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    // Error type is unknown - we don't know what kind of error this is
  }

  console.log('\n');
}

/**
 * Demo: Neverthrow error handling
 */
async function demoNeverthrow() {
  console.log('=== Neverthrow Result Approach ===\n');

  // Success case
  const result1 = await neverthrowCreateUser({ name: 'John Doe', email: 'john@example.com' });
  
  if (result1.isOk()) {
    console.log('✅ Success:', result1.value);
  } else {
    console.log(`❌ Error (${result1.error.type}):`, result1.error.message);
  }

  // Error case with explicit error handling
  const result2 = await neverthrowCreateUser({ name: 'Jane', email: 'jane@blocked.com' });
  
  result2.match(
    (user) => console.log('✅ Success:', user),
    (error) => {
      // Error type is known and typed!
      console.log(`❌ Error (${error.type}):`, error.message);
      
      // We can handle different error types explicitly
      switch (error.type) {
        case 'VALIDATION_ERROR':
          console.log('   → This is a validation error - show form validation');
          break;
        case 'NETWORK_ERROR':
          console.log('   → This is a network error - show retry button');
          break;
        case 'SERVER_ERROR':
          console.log('   → This is a server error - show contact support');
          break;
      }
    }
  );

  // Chaining operations
  console.log('\n--- Chaining Operations ---');
  
  const chainedResult = await neverthrowCreateUser({ name: 'Alice', email: 'alice@example.com' })
    .map(user => ({ ...user, displayName: `${user.name} (${user.email})` }))
    .map(user => ({ ...user, isActive: true }));
  
  if (chainedResult.isOk()) {
    console.log('✅ Chained result:', chainedResult.value);
  } else {
    console.log('❌ Chained error:', chainedResult.error);
  }

  console.log('\n');
}

/**
 * Demo: Complex data flow without try/catch
 */
async function demoComplexFlow() {
  console.log('=== Complex Data Flow (No Try/Catch!) ===\n');

  const users = [
    { name: 'Alice', email: 'alice@example.com', age: 25 },
    { name: 'Bob', email: 'bob@blocked.com', age: 30 },
    { name: '', email: 'invalid@example.com', age: 35 }, // Invalid
    { name: 'Charlie', email: 'charlie@example.com', age: 40 },
  ];

  const results = await Promise.all(
    users.map(userData => neverthrowCreateUser(userData))
  );

  const successes = results.filter(r => r.isOk()).map(r => r.value);
  const errors = results.filter(r => r.isErr()).map(r => r.error);

  console.log(`✅ Successfully created ${successes.length} users:`);
  successes.forEach(user => console.log(`   → ${user.name} (${user.email})`));

  console.log(`\n❌ Failed to create ${errors.length} users:`);
  errors.forEach(error => console.log(`   → ${error.type}: ${error.message}`));

  // Group errors by type
  const errorsByType = errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Error Summary:');
  Object.entries(errorsByType).forEach(([type, count]) => {
    console.log(`   → ${type}: ${count} errors`);
  });
}

/**
 * Run all demos
 */
async function runDemos() {
  await demoTraditional();
  await demoNeverthrow();
  await demoComplexFlow();
  
  console.log('🎉 Demo complete!\n');
  console.log('Key Benefits of Neverthrow:');
  console.log('• ✅ Explicit error types (no more unknown errors)');
  console.log('• ✅ Compile-time error handling enforcement');
  console.log('• ✅ No more nested try/catch blocks');
  console.log('• ✅ Railway-oriented programming');
  console.log('• ✅ Functional composition of operations');
  console.log('• ✅ Better error categorization and handling');
}

// Run the demo
runDemos().catch(console.error);

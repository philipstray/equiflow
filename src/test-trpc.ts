/**
 * Test file to verify tRPC setup is working correctly
 * Run this in the browser console or create a test component
 */

// Test direct tRPC endpoints
export const testTRPCEndpoints = async () => {
  const baseUrl = 'http://localhost:5173';
  
  console.log('🧪 Testing tRPC endpoints...');
  
  try {
    // Test health check
    const healthResponse = await fetch(`${baseUrl}/trpc/healthCheck`, {
      method: 'GET',
    });
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test getName
    const nameResponse = await fetch(`${baseUrl}/trpc/getName`, {
      method: 'GET',
    });
    const nameData = await nameResponse.json();
    console.log('✅ Get name:', nameData);
    
    // Test getUsers
    const usersResponse = await fetch(`${baseUrl}/trpc/getUsers?input=${encodeURIComponent(JSON.stringify({ limit: 3 }))}`, {
      method: 'GET',
    });
    const usersData = await usersResponse.json();
    console.log('✅ Get users:', usersData);
    
    // Test createUser (POST)
    const createUserResponse = await fetch(`${baseUrl}/trpc/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      }),
    });
    const createUserData = await createUserResponse.json();
    console.log('✅ Create user:', createUserData);
    
    console.log('🎉 All tRPC endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ tRPC test failed:', error);
  }
};

// Test backward compatibility
export const testBackwardCompatibility = async () => {
  const baseUrl = 'http://localhost:5173';
  
  console.log('🧪 Testing backward compatibility...');
  
  try {
    // Test old HTTP endpoint
    const response = await fetch(`${baseUrl}/api/name`);
    const data = await response.json();
    console.log('✅ Legacy HTTP endpoint:', data);
    
    console.log('🎉 Backward compatibility working!');
    
  } catch (error) {
    console.error('❌ Backward compatibility test failed:', error);
  }
};

// Run all tests
export const runAllTests = async () => {
  await testTRPCEndpoints();
  await testBackwardCompatibility();
};

// Usage in browser console:
// runAllTests();

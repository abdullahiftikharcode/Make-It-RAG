/**
 * Simple API key test script
 * 
 * Usage: node test-api-key.js YOUR_API_KEY
 * 
 * This script tests your API key by making requests to various endpoints
 * and shows the response or error.
 */

// Use the CommonJS require style for node-fetch v2
const fetch = require('node-fetch');

// Constants
const API_BASE_URL = 'https://make-it-rag-1.onrender.com/api';
const API_KEY = process.argv[2];

// Check if API key was provided
if (!API_KEY) {
  console.error('Error: No API key provided');
  console.log('Usage: node test-api-key.js YOUR_API_KEY');
  process.exit(1);
}

console.log(`Testing API key: ${API_KEY.substring(0, 7)}...${API_KEY.substring(API_KEY.length - 4)}`);

// Function to make API requests
async function makeRequest(endpoint, method = 'GET', body = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      // Try both headers formats to see which one works
      'X-API-Key': API_KEY, // Using X-API-Key header
      'Authorization': `Bearer ${API_KEY}` // Using Bearer format
    };

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to ${endpoint}...`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.error('Error:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run tests
async function runTests() {
  console.log('\n=== Testing API Key Authentication ===\n');

  // Test 0: Test the API test endpoint specifically designed for API keys
  console.log('\n0. GET /api/api-test - Testing API key validation:');
  await makeRequest('/api-test');

  // Test 1: Get user profile
  console.log('\n1. GET /api/profile - Testing profile access:');
  await makeRequest('/profile');

  // Test 2: Get user settings
  console.log('\n2. GET /api/settings - Testing settings access:');
  await makeRequest('/settings');

  // Test 3: Get connections
  console.log('\n3. GET /api/connections - Testing connections access:');
  await makeRequest('/connections');
  
  // Test 4: Test a potentially API-key protected endpoint
  console.log('\n4. GET /api/api-status - Testing API key protected endpoint:');
  await makeRequest('/api-status');

  console.log('\n=== API Key Testing Complete ===');
}

// Run the tests
runTests().catch(err => {
  console.error('Test script error:', err);
}); 
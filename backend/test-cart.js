import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8000/api';

// Test data
const testUser = {
  email: 'test@brelis.com',
  password: 'test123'
};

const testProduct = {
  productId: '507f1f77bcf86cd799439011', // Sample MongoDB ObjectId
  size: 'M',
  quantity: 1
};

async function testCartAPI() {
  try {
    console.log('Testing Cart API...\n');

    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.log('Login failed, trying to register...');
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const registerData = await registerResponse.json();
      console.log('Register response:', registerData);
    }

    // Get token from login
    const token = loginData.data?.token;
    if (!token) {
      console.log('No token received, cannot continue testing');
      return;
    }

    // 2. Test get cart
    console.log('\n2. Testing get cart...');
    const getCartResponse = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const getCartData = await getCartResponse.json();
    console.log('Get cart response:', getCartData);

    // 3. Test add to cart
    console.log('\n3. Testing add to cart...');
    const addToCartResponse = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct),
    });

    const addToCartData = await addToCartResponse.json();
    console.log('Add to cart response:', addToCartData);

    // 4. Test get cart again
    console.log('\n4. Testing get cart after adding item...');
    const getCartResponse2 = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const getCartData2 = await getCartResponse2.json();
    console.log('Get cart response after adding item:', getCartData2);

    console.log('\nCart API test completed!');

  } catch (error) {
    console.error('Error testing cart API:', error);
  }
}

testCartAPI();

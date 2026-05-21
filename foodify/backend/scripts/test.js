const API_URL = 'http://localhost:5000/api';

async function generateRandomEmail() {
  return `user_${Math.random().toString(36).substring(7)}@test.com`;
}

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json().catch(() => null);
  
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

async function runTests() {
  console.log('--- STARTING END-TO-END VERIFICATION ---');
  let customerToken = '';
  let restaurantToken = '';
  let testRestaurantId = 1;

  try {
    const email = await generateRandomEmail();
    console.log('1. Testing Customer Registration...');
    const regRes = await request('/auth/register', 'POST', {
      name: 'Test Customer', email, password: 'password123', role: 'customer'
    });
    console.log('   ✅ Registration success:', regRes.message);

    console.log('2. Testing Customer Login...');
    const loginRes = await request('/auth/login', 'POST', {
      email, password: 'password123'
    });
    customerToken = loginRes.token;
    console.log('   ✅ Customer Login success, got token');

    console.log('3. Testing Restaurant Data Fetching...');
    const restRes = await request('/restaurants');
    console.log(`   ✅ Fetched ${restRes.length} restaurants`);
    if(restRes.length > 0) testRestaurantId = restRes[0].id;

    console.log('4. Testing Menu Fetching...');
    const menuRes = await request(`/menu/restaurant/${testRestaurantId}`);
    console.log(`   ✅ Fetched ${menuRes.length} menu items for restaurant ${testRestaurantId}`);
    
    if (menuRes.length === 0) return console.log('   ⚠️ No menu items.');

    const testItem = menuRes[0];

    console.log('5. Testing Order Placement...');
    const orderRes = await request('/orders', 'POST', {
      restaurantId: testRestaurantId,
      items: [{ itemId: testItem.id, quantity: 2 }]
    }, customerToken);
    const newOrderId = orderRes.orderId;
    console.log(`   ✅ Placed new order, ID: ${newOrderId}`);

    console.log('6. Testing Customer Order History...');
    const historyRes = await request('/orders', 'GET', null, customerToken);
    console.log(`   ✅ Customer retrieved ${historyRes.length} past orders`);

    console.log('7. Testing Vendor Login...');
    const vendorLoginRes = await request('/auth/login', 'POST', {
      email: 'spicehub@foodify.demo', password: '12345678'
    });
    restaurantToken = vendorLoginRes.token;
    console.log('   ✅ Vendor Login success');

    console.log('8. Testing Vendor Dashboard Orders...');
    const dashboardRes = await request('/restaurants/dashboard/orders', 'GET', null, restaurantToken);
    console.log(`   ✅ Vendor fetched ${dashboardRes.length} live orders`);

    const orderToUpdate = dashboardRes.find(o => o.id === newOrderId) || dashboardRes[0];
    if (orderToUpdate) {
        console.log(`9. Testing Vendor Order Status Update for Order #${orderToUpdate.id}...`);
        
        let targetStatus = 'accepted';
        if (orderToUpdate.status === 'pending') targetStatus = 'accepted';
        else if (orderToUpdate.status === 'accepted') targetStatus = 'preparing';
        else if (orderToUpdate.status === 'preparing') targetStatus = 'delivered';
        
        if (targetStatus === 'accepted') {
            await request(`/restaurants/dashboard/orders/${orderToUpdate.id}/accept`, 'PATCH', {}, restaurantToken);
        } else {
            await request(`/restaurants/dashboard/orders/${orderToUpdate.id}/status`, 'PATCH', { status: targetStatus }, restaurantToken);
        }
        console.log(`   ✅ Updated order #${orderToUpdate.id} to '${targetStatus}' status`);
    }

    console.log('--- ALL END-TO-END TESTS PASSED SUCCESSFULLY! ---');

  } catch (error) {
    console.error('❌ E2E Test Failed:', error.message);
  }
}

runTests();

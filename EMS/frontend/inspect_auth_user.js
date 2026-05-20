const supabaseUrl = 'https://ulpeljetplvpriaebcef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGVsamV0cGx2cHJpYWViY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzY1MTYsImV4cCI6MjA5NDYxMjUxNn0.M3qV_stL5ntGYqSe-YrFh4oqUJlQA8MizLFaio4SeqY';

async function main() {
  const email = 'admin_temp_151@votesphere.com';
  const password = 'password123';
  
  console.log(`Logging in as: ${email}...`);
  const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!authResponse.ok) {
    console.error('Login failed:', authResponse.status, await authResponse.text());
    return;
  }
  
  const authData = await authResponse.json();
  const accessToken = authData.access_token;
  const user = authData.user;
  console.log('Logged in successfully!');
  console.log('Auth User ID:', user.id);
  console.log('Auth User Email:', user.email);

  console.log('\nQuerying own profile from profiles table...');
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('Profiles found:', data);
  } else {
    console.error('Failed to query profiles:', response.status, await response.text());
  }
}

main();

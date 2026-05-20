const supabaseUrl = 'https://ulpeljetplvpriaebcef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGVsamV0cGx2cHJpYWViY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzY1MTYsImV4cCI6MjA5NDYxMjUxNn0.M3qV_stL5ntGYqSe-YrFh4oqUJlQA8MizLFaio4SeqY';

async function main() {
  const email = 'admin_temp_151@votesphere.com';
  const password = 'password123';
  
  console.log(`Logging in as super_admin: ${email}...`);
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
  console.log('Logged in successfully!');
  
  const electionId = 'a50faab3-e2a6-4a3a-a198-c744faca890d';
  // 2026-05-20T05:00:00Z is 10:00:00 AM local time (+5 timezone), which is in the past!
  const newStartDate = '2026-05-20T05:00:00Z'; 
  const newStatus = 'active';
  
  console.log(`Updating election ${electionId}:
  New Start Date: ${newStartDate}
  New Status: ${newStatus}`);
  
  const patchUrl = `${supabaseUrl}/rest/v1/elections?id=eq.${electionId}`;
  const patchResponse = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      start_date: newStartDate,
      status: newStatus
    })
  });
  
  if (!patchResponse.ok) {
    console.error('PATCH failed:', patchResponse.status, await patchResponse.text());
  } else {
    const updatedRows = await patchResponse.json();
    console.log('PATCH succeeded! Updated election rows:', updatedRows);
  }
}

main();

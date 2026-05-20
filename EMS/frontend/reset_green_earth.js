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
  
  try {
    console.log(`Resetting election ${electionId} counts...`);
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
        current_voters: 0,
        total_votes: 0,
        turnout_percentage: 0,
        waitlist_count: 0
      })
    });
    
    console.log('Elections PATCH response status:', patchResponse.status);
    console.log('Elections PATCH response body:', await patchResponse.text());

    console.log('Resetting candidates counts for this election...');
    const candUrl = `${supabaseUrl}/rest/v1/candidates?election_id=eq.${electionId}`;
    const candResponse = await fetch(candUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        vote_count: 0
      })
    });
    
    console.log('Candidates PATCH response status:', candResponse.status);
    console.log('Candidates PATCH response body:', await candResponse.text());
    
  } catch (err) {
    console.error('Error resetting:', err);
  }
}

main();

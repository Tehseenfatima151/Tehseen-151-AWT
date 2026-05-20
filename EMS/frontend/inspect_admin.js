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

  async function query(table, filter = '') {
    const url = `${supabaseUrl}/rest/v1/${table}?select=*${filter}`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to query ${table}: ${response.status} ${response.statusText} ${await response.text()}`);
    }
    return response.json();
  }

  try {
    const greenEarthId = 'a50faab3-e2a6-4a3a-a198-c744faca890d';
    
    console.log('\n================ ELECTION DETAILS ================');
    const elec = await query('elections', `&id=eq.${greenEarthId}`);
    console.log(elec[0]);

    console.log('\n================ REGISTRATIONS (ADMIN) ================');
    const regs = await query('voter_registrations', `&election_id=eq.${greenEarthId}`);
    console.log(`Found ${regs.length} registrations:`);
    regs.forEach(r => {
      console.log(`- ID: ${r.id}, User ID: ${r.user_id}, Status: ${r.status}, Secret ID: ${r.secret_id_code}, Masked: ${r.secret_id_masked}, Position: ${r.waitlist_position}`);
    });
    
    console.log('\n================ VOTES (ADMIN) ================');
    const votes = await query('votes', `&election_id=eq.${greenEarthId}`);
    console.log(`Found ${votes.length} votes in the votes table:`);
    votes.forEach(v => {
      console.log(`- Candidate ID: ${v.candidate_id}, Voter Hash: ${v.voter_hash}, Secret ID used: ${v.secret_id_code}`);
    });
  } catch (err) {
    console.error('Error querying:', err);
  }
}

main();

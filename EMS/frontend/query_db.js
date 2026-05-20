const supabaseUrl = 'https://ulpeljetplvpriaebcef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGVsamV0cGx2cHJpYWViY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzY1MTYsImV4cCI6MjA5NDYxMjUxNn0.M3qV_stL5ntGYqSe-YrFh4oqUJlQA8MizLFaio4SeqY';

async function query(table) {
  const url = `${supabaseUrl}/rest/v1/${table}?select=*`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to query ${table}: ${response.status} ${response.statusText} ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  try {
    console.log('Fetching profiles...');
    const profiles = await query('profiles');
    console.log('Profiles found:', profiles.length);
    profiles.forEach(p => {
      console.log(`- ID: ${p.id}, Name: ${p.name}, Role: ${p.role}, Email: ${p.email}`);
    });

    console.log('\nFetching elections...');
    const elections = await query('elections');
    console.log('Elections found:', elections.length);
    elections.forEach(e => {
      console.log(`- ID: ${e.id}, Title: ${e.title}, Status: ${e.status}, Start: ${e.start_date}, End: ${e.end_date}, Creator: ${e.creator_id}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

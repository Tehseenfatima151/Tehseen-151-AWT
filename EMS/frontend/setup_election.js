const supabaseUrl = 'https://ulpeljetplvpriaebcef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGVsamV0cGx2cHJpYWViY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzY1MTYsImV4cCI6MjA5NDYxMjUxNn0.M3qV_stL5ntGYqSe-YrFh4oqUJlQA8MizLFaio4SeqY';

async function fetchFromTable(table, queryStr = '') {
  const url = `${supabaseUrl}/rest/v1/${table}?${queryStr}`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${table}: ${response.statusText}`);
  }
  return response.json();
}

async function insertIntoTable(table, payload) {
  const url = `${supabaseUrl}/rest/v1/${table}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Failed to insert into ${table}: ${response.status} ${response.statusText} ${await response.text()}`);
  }
  return response.json();
}

async function updateTable(table, id, payload) {
  const url = `${supabaseUrl}/rest/v1/${table}?id=eq.${id}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Failed to update ${table}: ${response.status} ${response.statusText} ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  try {
    console.log('Searching for profiles...');
    const profiles = await fetchFromTable('profiles');
    console.log('All profiles count:', profiles.length);

    const targetEmail = 'fatimachoudhry94@gmail.com';
    let targetUser = profiles.find(p => p.email.toLowerCase() === targetEmail.toLowerCase());

    if (targetUser) {
      console.log(`Found target user: ID=${targetUser.id}, Name=${targetUser.name}, Role=${targetUser.role}`);
    } else {
      console.log(`User ${targetEmail} not found in profiles! Let us find any Super Admin or Election Creator...`);
      targetUser = profiles.find(p => p.role === 'election_creator' || p.role === 'super_admin');
      if (targetUser) {
        console.log(`Using fallback creator: ID=${targetUser.id}, Name=${targetUser.name}, Role=${targetUser.role}`);
      } else {
        throw new Error('No creator or admin profile found in the database. Please sign up first.');
      }
    }

    // Current local time is 2026-05-19T12:20:50+05:00
    // Let's create dates:
    // Registration deadline: 1 hour ago
    // Start date: 30 minutes ago
    // End date: 2 hours from now
    const now = new Date('2026-05-19T12:20:50+05:00');
    
    const regDeadline = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const startDate = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    console.log('\nCreating/Setting up an ACTIVE election...');
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('Registration Deadline:', regDeadline);

    // Let's see if we should insert a brand new election
    const electionPayload = {
      title: 'General Presidential Election 2026',
      description: 'Vote for the future of VoteSphere! This election is actively open for voting.',
      category: 'community',
      organization: 'VoteSphere Global',
      status: 'active', // To make it active right away so voters can vote
      creator_id: targetUser.id,
      start_date: startDate,
      end_date: endDate,
      registration_deadline: regDeadline,
      timezone: 'UTC',
      max_voters: 500,
      current_voters: 0,
      is_waitlist_enabled: false,
      require_secret_id: false, // Turn off secret ID for easier demo voting
      require_2fa: false,
      allow_anonymous: true
    };

    const insertedElections = await insertIntoTable('elections', electionPayload);
    const election = insertedElections[0];
    console.log('Successfully created Election:', election.id, '-', election.title);

    // Insert candidates for this election
    console.log('Adding candidates...');
    const candidates = [
      {
        election_id: election.id,
        name: 'Fatima Choudhry',
        designation: 'Democratic Reformist',
        manifesto: 'Empowering communities through digital democracy and secure transparent voting for everyone.',
        display_order: 1
      },
      {
        election_id: election.id,
        name: 'Tehseen Fatima',
        designation: 'Tech Innovator',
        manifesto: 'Driving high-tech integration into everyday processes to increase transparency and security.',
        display_order: 2
      }
    ];

    for (const c of candidates) {
      const insertedC = await insertIntoTable('candidates', c);
      console.log(`- Added Candidate: ${insertedC[0].name} (${insertedC[0].id})`);
    }

    console.log('\n--- Setup Completed successfully! ---');
    console.log(`Go to the Voter Dashboard now. The election "${election.title}" will show as Active and ready to receive votes!`);

  } catch (error) {
    console.error('Error in main setup:', error);
  }
}

main();

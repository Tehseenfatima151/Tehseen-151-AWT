const https = require('https');

const queries = ['burger', 'biryani', 'pizza', 'pasta', 'dessert', 'salad', 'chicken', 'wrap', 'drink', 'food'];

async function fetchIds(query) {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Extract IDs using regex, typical Unsplash image URLs: https://images.unsplash.com/photo-1546833999-b9f581a1996d
        const matches = [...data.matchAll(/photo-[a-zA-Z0-9\-]+/g)];
        const ids = [...new Set(matches.map(m => m[0]))].slice(0, 15);
        resolve({ query, ids });
      });
    }).on('error', () => resolve({ query, ids: [] }));
  });
}

async function run() {
  const results = {};
  for (const q of queries) {
    const res = await fetchIds(q);
    results[q] = res.ids;
  }
  console.log(JSON.stringify(results, null, 2));
}

run();

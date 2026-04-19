import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error("Missing SUPABASE env vars. Check .env file.")
  process.exit(1)
}

const supabase = createClient(url, key)

async function testFetch() {
  console.log("--> Fetching opportunities (equiv to listOpportunities)...")
  const start = Date.now()
  const { data, error } = await supabase.from('opportunities').select('*').limit(1)
  console.log(`Fetch completed in ${Date.now() - start}ms`)
  if (error) {
    console.error("Fetch Error:", error)
  } else {
    console.log("Fetch Data:", data)
  }
}

async function testInsert() {
  console.log("\n--> Trying arbitrary insert on opportunities...")
  const start = Date.now()
  // Try inserting with invalid UUID to explicitly trigger Postgres constraint error without hanging
  const { error } = await supabase.from('opportunities').insert({
    title: "Test",
    description: "Test",
    deadline: "2026-05-28",
    created_by: "00000000-0000-0000-0000-000000000000"
  }).select()
  console.log(`Insert completed in ${Date.now() - start}ms`)
  if (error) {
    console.error("Insert returned Error as expected:", error)
  } else {
    console.log("Insert worked, this shouldn't happen with dummy user")
  }
}

async function run() {
  try {
    await testFetch()
    await testInsert()
  } catch (err) {
    console.error("Caught a hard error:", err)
  }
  process.exit(0)
}

run()

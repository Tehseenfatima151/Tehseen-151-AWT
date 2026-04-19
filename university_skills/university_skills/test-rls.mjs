import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.log("Missing service role key.")
  process.exit(1)
}

const supabaseAdmin = createClient(url, key)

async function run() {
  console.log("Testing insert as purely service role...")
  const { error } = await supabaseAdmin.from('opportunities').insert({
    title: "Test",
    description: "Test",
    deadline: "2026-05-28",
    created_by: "00000000-0000-0000-0000-000000000000"
  }).select()
  console.log("Service role insert error:", error)
  process.exit(0)
}
run()

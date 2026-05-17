const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from("assignments").select("*").limit(1);
  if (error) {
    console.error("Error fetching assignments:", error);
  } else {
    console.log("Assignments keys:", data.length > 0 ? Object.keys(data[0]) : "No rows found");
  }
}
check();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dlsxedqjygnomttklvgx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc3hlZHFqeWdub210dGtsdmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI4MjgsImV4cCI6MjA5ODA1ODgyOH0.vgbGNuy9S57WoQOEM5YEanu9Z6fhOuyaom4wDmM9IgA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("Checking Supabase Storage buckets...");
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
    } else {
      console.log("Available buckets:", buckets);
    }
  } catch (err) {
    console.error("Exception checking buckets:", err);
  }
}

check();

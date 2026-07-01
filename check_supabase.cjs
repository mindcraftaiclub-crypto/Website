const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dlsxedqjygnomttklvgx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc3hlZHFqeWdub210dGtsdmd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ4MjgyOCwiZXhwIjoyMDk4MDU4ODI4fQ.23zf3RcneyEq4QjGkpYygIZ68bFFDU5fWQLh5KcPoAs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log("Checking Supabase Storage buckets using Service Role key...");
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

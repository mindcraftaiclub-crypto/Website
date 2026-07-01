const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dlsxedqjygnomttklvgx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc3hlZHFqeWdub210dGtsdmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI4MjgsImV4cCI6MjA5ODA1ODgyOH0.vgbGNuy9S57WoQOEM5YEanu9Z6fhOuyaom4wDmM9IgA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  console.log("Testing upload to 'uploads' bucket...");
  const dummyFileContent = "hello world";
  const dummyFile = Buffer.from(dummyFileContent, 'utf-8');
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload('test_dummy.txt', dummyFile, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (error) {
      console.error("Upload error returned by Supabase:", error);
    } else {
      console.log("Upload SUCCESS! File data:", data);
    }
  } catch (err) {
    console.error("Exception occurred during upload:", err);
  }
}

testUpload();

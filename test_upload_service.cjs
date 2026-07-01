const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dlsxedqjygnomttklvgx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc3hlZHFqeWdub210dGtsdmd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ4MjgyOCwiZXhwIjoyMDk4MDU4ODI4fQ.23zf3RcneyEq4QjGkpYygIZ68bFFDU5fWQLh5KcPoAs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUploadService() {
  console.log("Testing upload using Service Role key to 'uploads' bucket...");
  const dummyFileContent = "hello world from service key";
  const dummyFile = Buffer.from(dummyFileContent, 'utf-8');
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload('test_dummy_service.txt', dummyFile, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (error) {
      console.error("Upload error with service role key:", error);
    } else {
      console.log("Upload SUCCESS with service role key! File data:", data);
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl('test_dummy_service.txt');
      console.log("Public URL:", publicUrlData.publicUrl);
    }
  } catch (err) {
    console.error("Exception occurred:", err);
  }
}

testUploadService();

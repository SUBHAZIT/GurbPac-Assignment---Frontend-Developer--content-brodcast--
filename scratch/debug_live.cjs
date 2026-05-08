
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLiveContent() {
  const now = new Date().toISOString();
  console.log('Checking live content at:', now);
  
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('status', 'approved');
    
  if (error) {
    console.error('Error fetching content:', error);
    return;
  }
  
  console.log(`Found ${data.length} approved items.`);
  data.forEach(item => {
    console.log(`- Title: ${item.title}`);
    console.log(`  ID: ${item.id}`);
    console.log(`  Teacher ID: ${item.teacher_id}`);
    console.log(`  Is Broadcasting: ${item.is_broadcasting}`);
    console.log(`  Is Deleted: ${item.is_deleted}`);
    console.log(`  Start: ${item.start_time}`);
    console.log(`  End: ${item.end_time}`);
  });
}

checkLiveContent();

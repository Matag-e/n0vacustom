import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ejzimdctlmmeylmlfmvj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqemltZGN0bG1tZXlsbWxmbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjAwNDUsImV4cCI6MjA4ODY5NjA0NX0.HAYy0jgtB-7hKuf9wrtZIJM-B2GL0FVLGrNZEAU4y9Y');

async function check() {
  const { data, error } = await supabase.from('products').select('id, name, category');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Products:', JSON.stringify(data, null, 2));
  }
}

check();
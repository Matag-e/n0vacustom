import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejzimdctlmmeylmlfmvj.supabase.co';
// Service Role Key is required to bypass email confirmation and RLS
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqemltZGN0bG1tZXlsbWxmbXZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzEyMDA0NSwiZXhwIjoyMDg4Njk2MDQ1fQ.oHy_BmQaHsAACx0pg5FsoB8bCRlRoj2yL6L33xgSRIk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const email = 'novacustom2k26@gmail.com';
  const password = 'admin123'; // Default password

  console.log(`Creating user ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto confirm email
    user_metadata: {
      full_name: 'Nova Custom Admin'
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user);
    
    // Also ensure profile exists (though trigger might handle it, let's be safe)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: email,
        full_name: 'Nova Custom Admin',
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating profile:', profileError.message);
    } else {
      console.log('Profile created/updated successfully.');
    }
  }
}

createAdminUser();

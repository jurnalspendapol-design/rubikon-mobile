import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ussbvwctonbmzobqxxrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc2J2d2N0b25ibXpvYnF4eHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODAyNzQsImV4cCI6MjA4NzY1NjI3NH0.hBLV8MtS15tWdTJs-RI2xn5z8Rwv00Z3KIwOHd1j21k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'counselor');
  console.log('Counselors:', data);
}

check();

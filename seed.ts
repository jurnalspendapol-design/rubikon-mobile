import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ussbvwctonbmzobqxxrp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc2J2d2N0b25ibXpvYnF4eHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODAyNzQsImV4cCI6MjA4NzY1NjI3NH0.hBLV8MtS15tWdTJs-RI2xn5z8Rwv00Z3KIwOHd1j21k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const { data, error } = await supabase.from('users').select('*').eq('email', 'konselor@sekolah.id').single();
  
  if (!data) {
    const { error: insertError } = await supabase.from('users').insert({
      name: 'Guru BK Utama',
      email: 'konselor@sekolah.id',
      password: 'password123',
      role: 'counselor'
    });
    
    if (insertError) {
      console.error('Error creating counselor:', insertError);
    } else {
      console.log('Counselor account created successfully!');
    }
  } else {
    console.log('Counselor account already exists.');
  }
}

seed();

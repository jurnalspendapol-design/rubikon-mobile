import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ussbvwctonbmzobqxxrp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc2J2d2N0b25ibXpvYnF4eHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODAyNzQsImV4cCI6MjA4NzY1NjI3NH0.hBLV8MtS15tWdTJs-RI2xn5z8Rwv00Z3KIwOHd1j21k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

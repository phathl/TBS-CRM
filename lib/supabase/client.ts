
import { createClient } from '@supabase/supabase-js';

// Configuration from environment variables
const SUPABASE_URL = 'https://xyzcompany.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJxhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

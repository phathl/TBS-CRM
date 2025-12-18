
import { createClient } from '@supabase/supabase-js';

// Configuration from environment variables
const SUPABASE_URL = 'https://eqdhuyoyvevgumhztrhu.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_XzAklSZdRbv3HcylAvUhlA_6wvpuzJY'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

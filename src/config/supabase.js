import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://inklqnkbichbcnbeycui.supabase.co';
const supabaseAnonKey = 'sb_publishable_0yFCAm6yfM_1p5j59u5C8A_xnyeas_Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgrfjqyxjnfibnoyhmtp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpncmZqcXl4am5maWJub3lobXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjIxMTUsImV4cCI6MjA4NDg5ODExNX0.S2KxE4ABxBIyVF75vfpREc9pMfxPrz1KSCjVMXN50FM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
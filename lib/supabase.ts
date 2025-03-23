// lib/supabase.ts
import 'react-native-url-polyfill/auto'


import { createClient } from '@supabase/supabase-js'

// Replace these with your actual project values from Supabase dashboard
const supabaseUrl = 'https://nuepszimaphkenhhbies.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXBzemltYXBoa2VuaGhiaWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTQ0NjQsImV4cCI6MjA1ODI5MDQ2NH0.Gqbd3mVaoPaVw3dTjuvu6sxqKrX180P_ie6GJDFkfyg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

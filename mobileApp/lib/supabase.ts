import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://uxctabsuocwyfobklkyh.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3RhYnN1b2N3eWZvYmtsa3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzNDk4NDgsImV4cCI6MjAyNDkyNTg0OH0.vaSFhg9fBZYKkFnAtlHVTh0BUxURBDEKVqDGX7stydw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
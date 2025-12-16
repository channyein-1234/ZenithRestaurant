// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Read credentials from .env file
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUBABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

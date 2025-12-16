import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://YOUR_PROJECT.supabase.co",
  "YOUR_SERVICE_ROLE_KEY"
);

const createAdmin = async () => {
  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@example.com",
    password: "supersecretpassword",
    email_confirm: true,
    user_metadata: { username: "AdminUser" }
  });

  if (error) throw error;
  console.log("Admin created:", user);
};

createAdmin();

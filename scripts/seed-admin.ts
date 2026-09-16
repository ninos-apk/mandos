import { createSupabaseAdminClient } from "../lib/supabase/admin";

const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("INITIAL_ADMIN_EMAIL und INITIAL_ADMIN_PASSWORD müssen in .env.local gesetzt sein.");
}

const supabase = createSupabaseAdminClient();
const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;

let user = usersData.users.find((candidate) => candidate.email?.toLowerCase() === email);
if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: user.id,
  email,
  display_name: "Administrator",
  role: "admin",
});
if (profileError) throw profileError;

console.log(`Admin ${email} ist eingerichtet.`);

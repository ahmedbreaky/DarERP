// Database security tests. Runs every migration in supabase/migrations against
// an in-memory Postgres (PGlite) with a small stand-in for Supabase Auth.
// Run: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const dir = new URL("../../supabase/migrations/", import.meta.url);
const migration = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()
  .map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
const db = new PGlite();

// --- Minimal stand-in for Supabase's auth schema + roles ---
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
`);
await db.exec(migration);

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
const C = "00000000-0000-0000-0000-00000000000c";

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
async function as(uid, sql, params = []) {
  await db.exec(`reset role; set request.jwt.claim.sub = '${uid ?? ""}';`);
  await db.exec(uid === "anon" ? "set role anon" : "set role authenticated");
  try { return { rows: (await db.query(sql, params)).rows }; }
  catch (e) { return { error: e.message }; }
  finally { await db.exec("reset role; set request.jwt.claim.sub = '';"); }
}
async function signup(id, email, name) {
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`,
    [id, email, JSON.stringify({ full_name: name })]);
}

await signup(A, "a@x.com", "Admin A");
await signup(B, "b@x.com", "Bob");
await signup(C, "c@x.com", "Cara");

const all = (await db.query("select id, role, is_active, full_name from public.profiles order by email")).rows;
check("first user is active admin", all[0].role === "admin" && all[0].is_active === true);
check("second user is inactive staff", all[1].role === "staff" && all[1].is_active === false);
check("full_name copied from metadata", all[1].full_name === "Bob");

// Inactive staff sees only themselves and has no permissions
let r = await as(B, "select id from public.profiles");
check("inactive staff sees only self", r.rows?.length === 1 && r.rows[0].id === B, JSON.stringify(r));
r = await as(B, "select * from public.my_permissions()");
check("inactive staff has no permissions", r.rows?.length === 0, JSON.stringify(r));

// Staff can't activate themselves or change role
r = await as(B, "update public.profiles set is_active = true where id = $1", [B]);
check("staff cannot self-activate", !!r.error && r.error.includes("not_allowed"), JSON.stringify(r));
r = await as(B, "update public.profiles set role = 'admin' where id = $1", [B]);
check("staff cannot self-promote", !!r.error, JSON.stringify(r));
r = await as(B, "update public.profiles set full_name = 'Bobby' where id = $1 returning full_name", [B]);
check("staff can edit own name", r.rows?.[0]?.full_name === "Bobby", JSON.stringify(r));
r = await as(B, "update public.profiles set email = 'evil@x.com' where id = $1", [B]);
check("staff cannot change email column", !!r.error, JSON.stringify(r));
r = await as(B, "update public.profiles set full_name = 'hack' where id = $1 returning id", [C]);
check("staff cannot edit others (0 rows)", r.rows?.length === 0, JSON.stringify(r));

// Admin sees everyone, can activate + promote
r = await as(A, "select id from public.profiles");
check("admin sees all", r.rows?.length === 3);
r = await as(A, "select * from public.my_permissions()");
check("admin has all permissions", r.rows?.length === 3, JSON.stringify(r));
r = await as(A, "update public.profiles set is_active = true, role = 'manager' where id = $1 returning role", [B]);
check("admin can activate + set manager", r.rows?.[0]?.role === "manager", JSON.stringify(r));

// Manager: users.view but not users.manage
r = await as(B, "select id from public.profiles");
check("manager sees all users", r.rows?.length === 3, JSON.stringify(r));
r = await as(B, "update public.profiles set is_active = true where id = $1 returning id", [C]);
check("manager cannot activate others", r.rows?.length === 0 || !!r.error, JSON.stringify(r));
r = await as(B, "select public.has_permission('users.view') as v, public.has_permission('users.manage') as m");
check("manager has users.view only", r.rows?.[0]?.v === true && r.rows?.[0]?.m === false, JSON.stringify(r));

// Role permissions editing
r = await as(B, "insert into public.role_permissions values ('manager', 'users.manage')");
check("manager cannot grant permissions", !!r.error, JSON.stringify(r));
r = await as(A, "insert into public.role_permissions values ('staff', 'users.view') returning role");
check("admin can grant permission to staff", r.rows?.length === 1, JSON.stringify(r));
r = await as(A, "insert into public.role_permissions values ('admin', 'users.view')");
check("admin row is not stored (check constraint)", !!r.error, JSON.stringify(r));
r = await as(A, "delete from public.role_permissions where role = 'staff' and permission = 'users.view' returning role");
check("admin can revoke permission", r.rows?.length === 1, JSON.stringify(r));

// Last admin protection
r = await as(A, "update public.profiles set role = 'staff' where id = $1", [A]);
check("last admin cannot be demoted", !!r.error && r.error.includes("last_admin"), JSON.stringify(r));
r = await as(A, "update public.profiles set is_active = false where id = $1", [A]);
check("last admin cannot be deactivated", !!r.error && r.error.includes("last_admin"), JSON.stringify(r));
await as(A, "update public.profiles set is_active = true, role = 'admin' where id = $1", [C]);
r = await as(A, "update public.profiles set role = 'staff' where id = $1 returning role", [A]);
check("admin can step down when another admin exists", r.rows?.[0]?.role === "staff", JSON.stringify(r));

// Anonymous
r = await as("anon", "select * from public.profiles");
check("anon cannot read profiles", !!r.error || r.rows?.length === 0, JSON.stringify(r));
r = await as("anon", "select public.has_permission('users.view')");
check("anon cannot call has_permission", !!r.error, JSON.stringify(r));

// Email sync
await db.query("update auth.users set email = 'new@x.com' where id = $1", [C]);
const c = (await db.query("select email from public.profiles where id = $1", [C])).rows[0];
check("email change syncs to profile", c.email === "new@x.com");

// Cascade delete
await db.query("delete from auth.users where id = $1", [C]);
const cnt = (await db.query("select count(*)::int n from public.profiles")).rows[0].n;
check("deleting auth user removes profile", cnt === 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

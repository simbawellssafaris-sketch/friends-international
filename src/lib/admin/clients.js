import "server-only";

// Finds an existing client for an enquiry (same email, else same phone) or creates one, so converting
// an enquiry never creates a second record for the same person. `db` is the signed-in administrator's Supabase client.
export async function findClient(db, e) {
  const email = e.email ? e.email.trim().toLowerCase() : null;
  if (email) {
    const { data } = await db.from("clients").select("id").ilike("email", email.replace(/[%_]/g, "")).is("archived_at", null).limit(1);
    if (data?.[0]) return data[0].id;
  }
  const phone = (e.phone || e.whatsapp || "").trim().replace(/[,()"]/g, "");
  if (phone) {
    const { data } = await db.from("clients").select("id").or(`phone.eq.${phone},whatsapp.eq.${phone}`).is("archived_at", null).limit(1);
    if (data?.[0]) return data[0].id;
  }
  return null;
}

export async function findOrCreateClient(db, e, adminId) {
  const found = await findClient(db, e);
  if (found) return found;
  const email = e.email ? e.email.trim().toLowerCase() : null;
  const { data, error } = await db
    .from("clients")
    .insert({ full_name: e.full_name, email, phone: e.phone || null, whatsapp: e.whatsapp || null, country: e.country || null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

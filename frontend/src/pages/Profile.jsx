import { Save, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || "", email: user?.email || "", address: user?.address || "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try { const { data } = await api.patch("/auth/profile/", form); updateUser(data); setMessage("Your profile has been updated."); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }
  return <div className="profile-page"><div className="page-heading"><div><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Your profile</h1><p>Keep your details up to date so your community can stay in touch.</p></div></div><div className="profile-layout"><div className="panel profile-card"><div className="profile-avatar"><UserRound size={30} /></div><h2>{user?.full_name || user?.username}</h2><p>{user?.role === "admin" ? "Administrator" : "Community member"}</p><span className="profile-since">Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "today"}</span></div><form className="panel profile-form" onSubmit={submit}><h2>Personal information</h2><p>Update the information associated with your account.</p>{error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}<label className="field-label">Full name<input className="form-input" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label><label className="field-label">Email address<input className="form-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label className="field-label">Neighborhood / address<input className="form-input" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label><label className="field-label">Username<input className="form-input disabled-input" value={user?.username || ""} disabled /></label><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"} <Save size={16} /></button></form></div></div>;
}

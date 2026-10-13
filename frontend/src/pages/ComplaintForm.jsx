import { ArrowLeft, ArrowRight, MapPin, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../api/client";

export default function ComplaintForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: params.get("category") || "", location: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/categories/").then(({ data }) => setCategories(data.results || data)).catch((err) => setError(errorMessage(err)));
  }, []);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (file) payload.append("image", file);
      await api.post("/complaints/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/complaints");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }
  return <div className="form-page"><Link className="back-link" to="/dashboard"><ArrowLeft size={15} /> Back to overview</Link><div className="page-heading"><div><span className="eyebrow">MAKE YOUR VOICE HEARD</span><h1>Report an issue</h1><p>The more details you share, the faster we can help.</p></div><span className="form-illustration">📣</span></div>
    <form className="panel complaint-form" onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="field-label">What’s the issue? <span className="required">*</span><input className="form-input" name="title" value={form.title} onChange={change} placeholder="e.g. Broken streetlight on Oak Avenue" maxLength={200} required /><small>Keep it short and specific (up to 200 characters).</small></label>
      <label className="field-label">Category <span className="required">*</span><select className="form-input" name="category" value={form.category} onChange={change} required><option value="">Choose a category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.icon || "📍"} {item.name}</option>)}</select></label>
      <label className="field-label">Where is it? <span className="required">*</span><div className="input-wrap form-location"><MapPin size={17} /><input name="location" value={form.location} onChange={change} placeholder="Street address or nearby landmark" maxLength={255} required /></div><small>A precise location helps the right team get there.</small></label>
      <label className="field-label">Tell us more <span className="required">*</span><textarea className="form-input form-textarea" name="description" value={form.description} onChange={change} placeholder="Describe what happened, when you noticed it, and how it affects the neighborhood..." minLength={10} required /><small>{form.description.length} characters — please share at least 10.</small></label>
      <label className="field-label">Add a photo <span className="optional">(optional)</span><label className="upload-box"><UploadCloud size={23} /><strong>{file ? file.name : "Drop a photo here or browse"}</strong><span>JPG, PNG or WEBP · max 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label></label>
      <div className="form-note"><span>🔒</span> Your contact details are only shared with the team handling this report.</div>
      <div className="form-actions"><Link className="button button-outline" to="/dashboard">Cancel</Link><button className="button button-primary" type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit complaint"} {!loading && <ArrowRight size={16} />}</button></div>
    </form>
  </div>;
}

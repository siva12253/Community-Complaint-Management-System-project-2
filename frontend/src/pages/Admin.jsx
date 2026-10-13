import { Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { Link } from "react-router-dom";

const statuses = ["submitted", "under_review", "in_progress", "resolved", "closed"];
export default function Admin() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true);
    const params = { ordering: "-created_at" };
    if (query.trim()) params.search = query.trim();
    if (filter) params.status = filter;
    try { const { data } = await api.get("/admin/complaints/", { params }); setItems(data.results || data); setError(""); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, [query, filter]);
  async function updateStatus(id, status) {
    try { await api.patch(`/admin/complaints/${id}/`, { status }); await refresh(); }
    catch (err) { setError(errorMessage(err)); }
  }
  return <div className="list-page"><div className="page-heading"><div><span className="eyebrow">TEAM WORKSPACE</span><h1>Complaint management</h1><p>Review reports, coordinate responses, and keep neighbors in the loop.</p></div><div className="admin-tag"><ShieldCheck size={17} /> ADMIN</div></div>{error && <div className="alert alert-error">{error}</div>}<div className="admin-summary"><span><strong>{items.length}</strong> reports in this view</span><span>Keep statuses current to notify residents automatically.</span></div><div className="filter-bar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports or locations..." /></label><select className="plain-select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select></div>{loading ? <div className="panel empty-state">Loading reports…</div> : items.length ? <div className="panel admin-list">{items.map((item) => <div className="admin-row" key={item.id}><div className="admin-complaint"><span className="complaint-icon">{item.category_detail?.icon || "📌"}</span><div><Link to={`/complaints/${item.id}`}><strong>{item.title}</strong></Link><small>{item.location} · Reported by {item.reporter_name || "Resident"} · {new Date(item.created_at).toLocaleDateString()}</small></div></div><div className="admin-category">{item.category_detail?.name || "General"}</div><StatusBadge status={item.status} /><select aria-label={`Update status for ${item.title}`} className="status-select" value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select></div>)}</div> : <div className="panel empty-state">No reports found.</div>}</div>;
}

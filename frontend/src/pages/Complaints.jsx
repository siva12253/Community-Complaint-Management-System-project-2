import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function Complaints() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories/").then(({ data }) => setCategories(data.results || data)).catch((err) => setError(errorMessage(err)));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (category) params.category = category;
    api.get("/complaints/", { params })
      .then(({ data }) => setItems(data.results || data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, status, category]);

  return <div className="list-page"><div className="page-heading"><div><span className="eyebrow">YOUR NEIGHBORHOOD, YOUR VOICE</span><h1>My complaints</h1><p>Follow the issues you’ve reported and see what’s changing.</p></div></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints..." /></label><label className="select-filter"><SlidersHorizontal size={16} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label><select className="plain-select" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    {loading ? <div className="panel empty-state">Loading complaints…</div> : items.length ? <div className="panel table-panel"><div className="table-header"><span>COMPLAINT</span><span>CATEGORY</span><span>SUBMITTED</span><span>STATUS</span><span /></div>{items.map((item) => <Link className="table-row" key={item.id} to={`/complaints/${item.id}`}><span className="table-title"><span className="complaint-icon">{item.category_detail?.icon || "📌"}</span><strong>{item.title}</strong></span><span className="table-category">{item.category_detail?.name || "General"}</span><span className="table-date">{new Date(item.created_at).toLocaleDateString()}</span><StatusBadge status={item.status} /><ArrowRight className="row-arrow" size={16} /></Link>)}</div> : <div className="panel empty-state"><span className="empty-emoji">🔎</span><strong>No complaints match those filters</strong><p>Try changing your search, or report a new issue.</p></div>}
  </div>;
}

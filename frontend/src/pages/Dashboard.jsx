import { ArrowRight, ArrowUpRight, Check, Clock3, FileText, Plus, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/complaints/"), api.get("/categories/")])
      .then(([complaintResponse, categoryResponse]) => {
        setComplaints(complaintResponse.data.results || complaintResponse.data);
        setCategories(categoryResponse.data.results || categoryResponse.data);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const resolved = complaints.filter((item) => item.status === "resolved").length;
  const active = complaints.filter((item) => !["resolved", "closed"].includes(item.status)).length;
  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return <div className="dashboard-page">
    <section className="welcome-row"><div><span className="eyebrow">{today} <span className="welcome-sparkle">✳</span></span><h1>{greeting}, {user?.full_name?.split(" ")[0] || user?.username}<span className="wave"> ✨</span></h1><p>Here’s what’s happening in your neighborhood.</p></div><button className="button button-primary" onClick={() => navigate("/new-complaint")}><Plus size={17} /> Report an issue</button></section>
    {error && <div className="alert alert-error">{error}</div>}
    <section className="hero-card"><div className="hero-copy"><span className="hero-kicker"><Sparkles size={14} /> YOUR VOICE MATTERS</span><h2>Let’s make our<br />neighborhood <em>better.</em></h2><p>See something that needs attention? Let’s get it sorted, together.</p><button className="button button-white" onClick={() => navigate("/new-complaint")}>Submit a complaint <ArrowRight size={16} /></button></div><div className="hero-art" aria-hidden="true"><div className="sun-shape" /><div className="cloud cloud-one" /><div className="cloud cloud-two" /><div className="building building-back"><i /><i /><i /></div><div className="building building-front"><i /><i /><i /><i /></div><div className="tree tree-left" /><div className="tree tree-right" /><div className="ground-line" /><div className="hero-leaf leaf-one">✦</div><div className="hero-leaf leaf-two">✦</div></div><div className="hero-counter"><span><span className="online-dot" /> YOUR COMMUNITY</span><strong>1,284 <small>neighbors</small></strong><p>making a difference</p></div></section>
    <section className="stats-grid">
      <div className="stat-card"><span className="stat-icon icon-blue"><FileText size={19} /></span><span className="stat-label">TOTAL REPORTED</span><strong>{loading ? "—" : complaints.length.toString().padStart(2, "0")}</strong><span className="stat-foot">Your submitted complaints</span></div>
      <div className="stat-card"><span className="stat-icon icon-amber"><Clock3 size={19} /></span><span className="stat-label">IN PROGRESS</span><strong>{loading ? "—" : active.toString().padStart(2, "0")}</strong><span className="stat-foot">Being reviewed by the team</span></div>
      <div className="stat-card"><span className="stat-icon icon-green"><Check size={19} /></span><span className="stat-label">RESOLVED</span><strong>{loading ? "—" : resolved.toString().padStart(2, "0")}</strong><span className="stat-foot">Issues fixed in your area</span></div>
    </section>
    <section className="content-grid">
      <div className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>Recent complaints</h2></div><Link className="text-link" to="/complaints">View all <ArrowUpRight size={15} /></Link></div>
        {loading ? <div className="empty-state">Loading your complaints…</div> : complaints.length ? <div className="complaint-list">{complaints.slice(0, 4).map((complaint) => <Link className="complaint-row" key={complaint.id} to={`/complaints/${complaint.id}`}><span className="complaint-icon">{complaint.category_detail?.icon || "📌"}</span><span className="complaint-copy"><strong>{complaint.title}</strong><small>{complaint.category_detail?.name || "General"} <span>·</span> {new Date(complaint.created_at).toLocaleDateString()}</small></span><StatusBadge status={complaint.status} /><ArrowRight className="row-arrow" size={16} /></Link>)}</div> : <div className="empty-state"><span className="empty-emoji">📭</span><strong>No complaints just yet</strong><p>Your reported issues and their progress will show up here.</p><button className="button button-outline button-small" onClick={() => navigate("/new-complaint")}>Report your first issue</button></div>}
      </div>
      <div className="panel category-panel"><div className="panel-heading"><div><span className="eyebrow">GETTING STARTED</span><h2>Report by category</h2></div><Search size={18} className="muted-icon" /></div><div className="category-list">{(categories.length ? categories.slice(0, 5) : [{ id: 1, name: "Roads & sidewalks", icon: "🛣️" }, { id: 2, name: "Parks & recreation", icon: "🌳" }, { id: 3, name: "Waste & sanitation", icon: "♻️" }, { id: 4, name: "Street lighting", icon: "💡" }, { id: 5, name: "Water & drainage", icon: "💧" }]).map((category) => <button className="category-row" key={category.id} onClick={() => navigate(`/new-complaint?category=${category.id}`)}><span className="category-icon">{category.icon || "📍"}</span><span>{category.name}</span><ArrowRight size={15} /></button>)}</div><button className="category-footer" onClick={() => navigate("/new-complaint")}>Not seeing your issue? <strong>Report it anyway <ArrowRight size={13} /></strong></button></div>
    </section>
    <section className="community-tip"><span className="tip-icon">💡</span><span><strong>A little detail goes a long way.</strong> Clear descriptions help our team resolve issues faster. Include where, when, and what happened.</span><Link to="/new-complaint">Learn more <ArrowRight size={13} /></Link></section>
  </div>;
}

import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/client";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/notifications/").then(({ data }) => setItems(data.results || data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  async function markAll() {
    try { await api.post("/notifications/mark-all-read/"); setItems(items.map((item) => ({ ...item, is_read: true }))); }
    catch (err) { setError(errorMessage(err)); }
  }
  return <div className="list-page"><div className="page-heading heading-with-action"><div><span className="eyebrow">STAY IN THE LOOP</span><h1>Notifications</h1><p>Updates about your reports and community activity.</p></div>{items.some((item) => !item.is_read) && <button className="button button-outline button-small" onClick={markAll}><CheckCheck size={15} /> Mark all as read</button>}</div>{error && <div className="alert alert-error">{error}</div>}{loading ? <div className="panel empty-state">Loading notifications…</div> : items.length ? <div className="panel notification-list">{items.map((item) => <div key={item.id} className={`notification-row ${item.is_read ? "" : "notification-unread"}`}><span className="notification-icon"><Bell size={17} /></span><div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.created_at).toLocaleString()}</small></div>{item.complaint && <Link to={`/complaints/${item.complaint}`}>View report →</Link>}</div>)}</div> : <div className="panel empty-state"><span className="empty-emoji">🔔</span><strong>You’re all caught up</strong><p>When there’s an update on one of your reports, you’ll find it here.</p></div>}</div>;
}

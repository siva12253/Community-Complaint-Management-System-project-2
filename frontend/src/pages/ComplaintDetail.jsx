import { ArrowLeft, MapPin, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    api.get(`/complaints/${id}/`).then(({ data }) => setComplaint(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, [id]);
  async function addComment(event) {
    event.preventDefault();
    setSending(true); setError("");
    try {
      await api.post(`/complaints/${id}/comments/`, { body: comment });
      const { data } = await api.get(`/complaints/${id}/`);
      setComplaint(data); setComment("");
    } catch (err) { setError(errorMessage(err)); }
    finally { setSending(false); }
  }
  if (loading) return <div className="center-state">Loading complaint…</div>;
  if (!complaint) return <div className="panel empty-state">{error || "Complaint not found."}<p><Link to="/complaints">Return to your complaints</Link></p></div>;
  return <div className="detail-page"><Link className="back-link" to="/complaints"><ArrowLeft size={15} /> Back to my complaints</Link>{error && <div className="alert alert-error">{error}</div>}
    <div className="detail-layout"><div className="detail-main"><div className="panel detail-card"><div className="detail-topline"><span className="eyebrow">COMPLAINT #{complaint.id}</span><StatusBadge status={complaint.status} /></div><h1>{complaint.title}</h1><div className="detail-meta"><span>{complaint.category_detail?.icon || "📌"} {complaint.category_detail?.name || "General"}</span><span><MapPin size={14} />{complaint.location}</span><span>Submitted {new Date(complaint.created_at).toLocaleDateString()}</span></div><div className="detail-description">{complaint.description}</div>{complaint.image && <img className="complaint-image" src={complaint.image} alt="Submitted with this complaint" />}</div>
      <div className="panel discussion-card"><div className="panel-heading"><div><span className="eyebrow">KEEP THE CONVERSATION GOING</span><h2><MessageSquare size={19} /> Updates & comments</h2></div></div>{complaint.comments?.length ? <div className="comment-list">{complaint.comments.map((item) => <div className="comment-row" key={item.id}><span className="avatar">{item.author_name?.[0] || "N"}</span><div><strong>{item.author_name || "Community member"}</strong><small>{new Date(item.created_at).toLocaleString()}</small><p>{item.body}</p></div></div>)}</div> : <p className="muted-text">No updates yet. Leave a note for the team below.</p>}<form className="comment-form" onSubmit={addComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment or ask a question…" required /><button className="button button-primary button-small" disabled={sending}>{sending ? "Sending…" : "Send"} <Send size={14} /></button></form></div>
    </div><aside className="detail-sidebar"><div className="panel tracking-card"><span className="eyebrow">TRACKING</span><h3>Complaint timeline</h3><div className="timeline">{(complaint.history || []).map((event, index) => <div className={`timeline-item ${index === 0 ? "timeline-current" : ""}`} key={event.id}><span className="timeline-marker" /><strong>{event.status.replaceAll("_", " ")}</strong><small>{new Date(event.created_at).toLocaleString()}</small>{event.note && <p>{event.note}</p>}</div>)}</div></div><div className="panel response-card"><span className="response-icon">👋</span><strong>We’re on it.</strong><p>Our community team will review your report and keep you posted right here.</p></div></aside></div>
  </div>;
}

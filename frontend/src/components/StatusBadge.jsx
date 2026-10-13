export default function StatusBadge({ status }) {
  const label = (status || "submitted").replaceAll("_", " ");
  return <span className={`status-badge status-${status || "submitted"}`}><span />{label}</span>;
}

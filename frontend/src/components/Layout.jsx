import { Bell, ChevronDown, CircleHelp, ClipboardList, LayoutDashboard, LogOut, Menu, Plus, ShieldCheck, UserRound, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const userLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/complaints", label: "My complaints", icon: ClipboardList },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = user?.role === "admin"
    ? [...userLinks, { to: "/admin", label: "Admin workspace", icon: ShieldCheck }]
    : userLinks;

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark">n.</span><span>neighborly<span className="brand-dot">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} key={to} to={to}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Notifications" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={18} /></span><strong>Need a hand?</strong><p>Learn how to make your neighborhood better.</p><a href="mailto:support@neighborly.local">Visit help center <span>↗</span></a></div>
          <button className="profile-mini" onClick={() => navigate("/profile")}><span className="avatar">{user?.full_name?.[0] || user?.username?.[0] || "U"}</span><span className="profile-mini-copy"><strong>{user?.full_name || user?.username}</strong><small>{user?.role === "admin" ? "Administrator" : "Community member"}</small></span><ChevronDown size={16} /></button>
        </div>
      </aside>
      {open && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
          <div className="breadcrumb">Community hub <span>/</span> <strong>{links.find((item) => window.location.pathname.startsWith(item.to))?.label || "Profile"}</strong></div>
          <div className="top-actions"><button className="top-link" onClick={() => navigate("/notifications")}><Bell size={17} /><span>Updates</span></button><button className="button button-primary button-small" onClick={() => navigate("/new-complaint")}><Plus size={16} /> New complaint</button><button className="icon-button signout-button" title="Sign out" onClick={signOut}><LogOut size={17} /></button><button className="icon-button profile-shortcut" title="Profile" onClick={() => navigate("/profile")}><UserRound size={17} /></button></div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="footer"><span>© 2025 Neighborly Community Hub</span><span>Built together, for everyone <span className="footer-heart">♥</span></span></footer>
      </main>
    </div>
  );
}

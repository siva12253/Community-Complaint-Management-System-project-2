import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ register = false }) {
  const { user, login, register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "", email: "", full_name: "", address: "" });
  if (user) return <Navigate to="/dashboard" replace />;

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (register) await createAccount(form);
      else await login({ username: form.username, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link to="/login" className="brand auth-brand"><span className="brand-mark">n.</span><span>neighborly<span className="brand-dot">.</span></span></Link>
        <div className="story-content"><span className="eyebrow light-eyebrow">A better block starts here</span><h1>Small voices.<br /><em>Big change.</em></h1><p>Your community is stronger when everyone has a say. Let’s make it heard.</p><div className="story-stats"><div><strong>2.4k+</strong><span>neighbors connected</span></div><div><strong>94%</strong><span>issues resolved</span></div></div></div>
        <div className="story-note"><span>“</span><p>It feels good knowing someone is listening — and doing something about it.</p><small>— Jamie R., community member</small></div>
        <div className="story-orbit orbit-one" /><div className="story-orbit orbit-two" />
      </section>
      <section className="auth-panel"><div className="auth-form-wrap"><span className="eyebrow">{register ? "JOIN YOUR COMMUNITY" : "WELCOME BACK"}</span><h2>{register ? "Create your account" : "Good to see you."}</h2><p className="auth-subtitle">{register ? "A few details and you’re ready to make a difference." : "Sign in to stay in the loop and keep things moving."}</p>
        <form onSubmit={submit}>
          {register && <label className="field-label">Full name<div className="input-wrap"><UserRound size={17} /><input name="full_name" value={form.full_name} onChange={change} placeholder="Alex Morgan" required /></div></label>}
          <label className="field-label">{register ? "Username" : "Username"}<div className="input-wrap"><UserRound size={17} /><input name="username" autoComplete="username" value={form.username} onChange={change} placeholder="yourname" required /></div></label>
          {register && <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required /></div></label>}
          {register && <label className="field-label">Neighborhood / address<div className="input-wrap"><MapPin size={17} /><input name="address" value={form.address} onChange={change} placeholder="Your neighborhood" /></div></label>}
          <label className="field-label">Password<div className="input-wrap"><LockKeyhole size={17} /><input name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} value={form.password} onChange={change} placeholder={register ? "At least 8 characters" : "Enter your password"} minLength={register ? 8 : undefined} required /><button className="password-toggle" type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? "Please wait…" : register ? "Create account" : "Sign in"} {!submitting && <ArrowRight size={17} />}</button>
        </form>
        <p className="auth-switch">{register ? "Already part of the neighborhood?" : "New around here?"} <Link to={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
        <p className="auth-legal">By continuing, you agree to our <a href="mailto:legal@neighborly.local">Terms of Service</a> and <a href="mailto:privacy@neighborly.local">Privacy Policy</a>.</p>
      </div><div className="auth-bottom"><span>Made for the places we call home</span><span>Privacy · Support</span></div></section>
    </div>
  );
}

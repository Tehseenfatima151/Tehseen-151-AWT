import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/panda.css";

const REMEMBER_EMAIL_KEY = "foodify_auth_remember_email";

const initialForm = { name: "", email: "", password: "" };

const defaultEyeStyle = { leftTop: "20px", leftLeft: "13px", rightTop: "20px", rightLeft: "8px" };
const centeredEyeStyle = { leftTop: "10px", leftLeft: "10px", rightTop: "10px", rightLeft: "10px" };

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [eyeStyle, setEyeStyle] = useState(defaultEyeStyle);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const authWrapRef = useRef(null);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user?.role === "customer") navigate("/customer");
    if (user?.role === "restaurant") navigate("/restaurant");
    if (user?.role === "admin") navigate("/admin");
  }, [navigate, user]);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setForm((prev) => ({ ...prev, email: saved }));
      setRememberMe(true);
    }
  }, []);

  const onTextFocus = useCallback(() => {
    setPasswordFocused(false);
    setEyeTracking(true);
    setEyeStyle(defaultEyeStyle);
  }, []);

  const onPasswordFocus = useCallback(() => {
    setEyeTracking(false);
    setPasswordFocused(true);
    setEyeStyle(centeredEyeStyle);
  }, []);

  const onPasswordBlur = useCallback(() => {
    setPasswordFocused(false);
    requestAnimationFrame(() => {
      const el = document.activeElement;
      const name = el?.getAttribute?.("name");
      if (name === "email" || name === "name") {
        setEyeTracking(true);
        return;
      }
      setEyeStyle(defaultEyeStyle);
      setEyeTracking(false);
    });
  }, []);

  const handleTextBlur = useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.activeElement;
      const name = el?.getAttribute?.("name");
      if (name === "email" || name === "name") return;
      if (el?.getAttribute?.("data-keep-eye-tracking") === "true") return;
      setEyeTracking(false);
      setEyeStyle(defaultEyeStyle);
    });
  }, []);

  const handleAuthPointerMove = useCallback(
    (e) => {
      if (!eyeTracking || passwordFocused) return;
      const wrap = authWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const fx = rect.left + rect.width / 2;
      const fy = rect.top + rect.height * 0.22;
      const nx = (e.clientX - fx) / (rect.width * 0.35);
      const ny = (e.clientY - fy) / (rect.height * 0.25);
      const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      const dx = clamp(nx, -1, 1);
      const dy = clamp(ny, -1, 1);
      setEyeStyle({
        leftTop: `${clamp(10 + dy * 6, 6, 18)}px`,
        leftLeft: `${clamp(10 + dx * 7, 5, 17)}px`,
        rightTop: `${clamp(10 + dy * 6, 6, 18)}px`,
        rightLeft: `${clamp(10 + dx * 7, 4, 16)}px`,
      });
    },
    [eyeTracking, passwordFocused]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (mode === "register") {
      const trimmed = form.name.trim();
      if (trimmed.length < 2) errs.name = "Please enter at least 2 characters.";
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) errs.email = "Please enter a valid email address.";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    if (!validate()) {
      setIsError(true);
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: "customer",
        });
        setMessage("Registration successful. Please sign in.");
        setIsError(false);
        setMode("login");
        setForm({ ...initialForm, email: form.email.trim() });
        setFieldErrors({});
        return;
      }

      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, form.email.trim());
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);
      login(data);
      if (data.user.role === "customer") navigate("/customer");
      if (data.user.role === "restaurant") navigate("/restaurant");
      if (data.user.role === "admin") navigate("/admin");
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setMessage("");
    setIsError(false);
    setFieldErrors({});
    setShowPassword(false);
    setPasswordFocused(false);
    setEyeTracking(false);
    setEyeStyle(defaultEyeStyle);
    if (next === "login") setForm((prev) => ({ ...initialForm, email: prev.email }));
    else setForm({ ...initialForm, email: form.email.trim() });
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotMessage("");
    setForgotSubmitted(false);
  };

  const submitForgotDemo = (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim());
    if (!ok) {
      setForgotMessage("Please enter a valid email.");
      setForgotSubmitted(false);
      return;
    }
    setForgotMessage("Password reset link sent (demo only)");
    setForgotSubmitted(true);
  };

  const heading = mode === "login" ? "Sign in to your account" : "Create your account";

  return (
    <div className="auth-page" onMouseMove={handleAuthPointerMove} onTouchMove={handleAuthPointerMove}>
      <div
        ref={authWrapRef}
        className={`auth-wrap ${mode === "register" ? "mode-register" : "mode-login"}${passwordFocused ? " password-active" : ""}`}
      >
        <div className={`login ${mode === "register" ? "is-register" : ""}`}>
          <h1 className="auth-heading">{heading}</h1>
          <form onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">
                  Name
                </label>
                <div className="auth-input-row">
                  <i className="fa fa-user" aria-hidden="true" />
                  <input
                    id="auth-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onFocus={onTextFocus}
                    onBlur={handleTextBlur}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                {fieldErrors.name && <p className="auth-field-error">{fieldErrors.name}</p>}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">
                Email
              </label>
              <div className="auth-input-row">
                <i className="fa fa-envelope" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onFocus={onTextFocus}
                  onBlur={handleTextBlur}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
              {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
            </div>

            <div className="auth-field">
              <div className="auth-password-label-row">
                <label className="auth-label auth-label--inline" htmlFor="auth-password">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="auth-forgot-link"
                    data-keep-eye-tracking="true"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotEmail(form.email.trim());
                      setForgotMessage("");
                      setForgotSubmitted(false);
                    }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="auth-password-wrap">
                <div className="auth-input-row auth-input-row--password">
                  <i className="fa fa-unlock-alt" aria-hidden="true" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={form.password}
                    onFocus={onPasswordFocus}
                    onBlur={onPasswordBlur}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    data-keep-eye-tracking="true"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
            </div>

            {mode === "login" && (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-submit-inner">
                  <span className="auth-spinner" aria-hidden="true" />
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </span>
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Register"
              )}
            </button>

            <div className="status-message" role="status">
              {message && (
                <span className={isError ? "status-error" : "status-success"}>{message}</span>
              )}
            </div>

            <div className="toggle-row toggle-link">
              <span className="toggle-row__text">{mode === "login" ? "No account?" : "Already have an account?"}</span>
              <button type="button" className="auth-mode-switch" onClick={() => switchMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Register" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="auth-card-paws" aria-hidden="true">
            <div className="pawl">
              <div className="p1">
                <div className="p2"></div>
                <div className="p3"></div>
                <div className="p4"></div>
              </div>
            </div>
            <div className="pawr">
              <div className="p1">
                <div className="p2"></div>
                <div className="p3"></div>
                <div className="p4"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="backg">
          <div className="panda">
            <div className="earl"></div>
            <div className="earr"></div>
            <div className="face">
              <div className="blshl"></div>
              <div className="blshr"></div>
              <div className="eyel">
                <div
                  className={`eyeball1${eyeTracking && !passwordFocused ? " eyeball--tracking" : ""}`}
                  style={{ top: eyeStyle.leftTop, left: eyeStyle.leftLeft }}
                />
              </div>
              <div className="eyer">
                <div
                  className={`eyeball2${eyeTracking && !passwordFocused ? " eyeball--tracking" : ""}`}
                  style={{ top: eyeStyle.rightTop, left: eyeStyle.rightLeft }}
                />
              </div>
              <div className="nose">
                <div className="line"></div>
              </div>
              <div className="mouth">
                <div className="m">
                  <div className="m1"></div>
                </div>
                <div className="mm">
                  <div className="m1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="handl" />
        <div className="handr" />
      </div>

      {forgotOpen && (
        <div className="auth-modal-overlay" role="presentation" onClick={closeForgot}>
          <div
            className="auth-modal"
            role="dialog"
            aria-labelledby="forgot-title"
            aria-modal="true"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h2 id="forgot-title" className="auth-modal-title">
              Reset password
            </h2>
            <p className="auth-modal-hint">Enter your email and we&apos;ll send reset instructions (demo only).</p>
            <form onSubmit={submitForgotDemo}>
              <label className="auth-label" htmlFor="forgot-email">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="auth-modal-input"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  if (forgotMessage && !forgotSubmitted) setForgotMessage("");
                }}
                placeholder="you@example.com"
              />
              {forgotMessage && (
                <p className={forgotSubmitted ? "auth-modal-success" : "auth-modal-error"}>{forgotMessage}</p>
              )}
              <div className="auth-modal-actions">
                <button type="button" className="auth-modal-btn auth-modal-btn--ghost" onClick={closeForgot}>
                  Close
                </button>
                <button type="submit" className="auth-modal-btn auth-modal-btn--primary">
                  Send link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;

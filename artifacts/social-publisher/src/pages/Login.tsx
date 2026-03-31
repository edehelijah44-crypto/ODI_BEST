import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

type Tab = "login" | "register";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(c => (
            <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-green-400" : "text-muted-foreground"}`}>
              <CheckCircle2 className="w-3 h-3" /> {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${score >= 3 ? "text-green-400" : score === 2 ? "text-yellow-400" : "text-red-400"}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

function InputField({
  label, type = "text", value, onChange, placeholder, required, autoComplete, error, hint,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; autoComplete?: string; error?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white/80 block">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full h-12 px-4 rounded-xl bg-white/6 border text-white placeholder:text-white/30 text-sm
            focus:outline-none focus:ring-2 transition-all
            ${error
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
            } ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
      {hint && !error && <p className="text-white/30 text-xs">{hint}</p>}
    </div>
  );
}

export default function Login() {
  const { enableDemoMode, loginWithEmail, registerWithEmail } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const switchTab = (t: Tab) => {
    setTab(t);
    setErrors({});
    setServerError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (tab === "register" && name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (tab === "register" && password !== confirmPassword) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      if (tab === "register") {
        await registerWithEmail(name.trim(), email.trim(), password);
        setSuccess("Account created! Taking you in…");
      } else {
        await loginWithEmail(email.trim(), password);
        setSuccess("Welcome back! Loading your dashboard…");
      }
      setTimeout(() => { window.location.href = "/"; }, 1000);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#07070f]">

      {/* Left panel — only on desktop */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070f] via-[#07070f]/40 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-lg px-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white/90">The Future of Publishing</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-5">
            Create once.<br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Publish everywhere.
            </span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Connect all your social accounts and auto-publish your content everywhere — in one tap.
          </p>
          {/* Social proof */}
          <div className="flex flex-col gap-3">
            {[
              { icon: "📘", text: "Facebook · Instagram" },
              { icon: "▶️", text: "YouTube · TikTok" },
              { icon: "𝕏", text: "Twitter / X" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/50 text-sm">
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
                <div className="flex-1 border-t border-white/10" />
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Mobile BG */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <img src={`${import.meta.env.BASE_URL}images/auth-bg.png`} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-[#07070f]/85 backdrop-blur-xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 p-[2px] shadow-lg shadow-violet-500/30">
              <div className="w-full h-full bg-[#0f0f1e] rounded-[14px] flex items-center justify-center">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-9 h-9 object-contain" />
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">

            {/* Tab switcher */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
              {(["login", "register"] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${tab === t
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"
                    }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Success banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-green-500/15 border border-green-500/25 rounded-xl px-4 py-3 mb-5"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <p className="text-green-300 text-sm font-medium">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-500/12 border border-red-500/25 rounded-xl px-4 py-3 mb-5"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === "register" ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {tab === "register" && (
                    <InputField
                      label="Full Name"
                      value={name}
                      onChange={setName}
                      placeholder="Your name"
                      autoComplete="name"
                      error={errors.name}
                    />
                  )}
                  <InputField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete={tab === "login" ? "email" : "email"}
                    required
                    error={errors.email}
                  />
                  <div>
                    <InputField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      placeholder={tab === "register" ? "Create a strong password" : "Your password"}
                      autoComplete={tab === "login" ? "current-password" : "new-password"}
                      required
                      error={errors.password}
                    />
                    {tab === "register" && <PasswordStrength password={password} />}
                  </div>
                  {tab === "register" && (
                    <InputField
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      error={errors.confirm}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {tab === "login" && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold text-sm
                  hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 mt-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {tab === "login" ? "Signing in…" : "Creating account…"}</>
                  : tab === "login" ? "Sign In" : "Create Account"
                }
              </button>
            </form>

            {/* Security note */}
            <div className="flex items-center gap-2 mt-5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <p className="text-white/30 text-xs">Passwords encrypted with bcrypt · Secure session</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 border-t border-white/8" />
              <span className="text-white/25 text-xs uppercase tracking-widest">or</span>
              <div className="flex-1 border-t border-white/8" />
            </div>

            {/* Demo mode */}
            <button
              type="button"
              onClick={enableDemoMode}
              className="w-full h-11 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/4
                text-sm font-medium transition-all flex items-center justify-center gap-2 group"
            >
              Continue in Demo Mode
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="text-center text-xs text-white/20 mt-5">
              By continuing you agree to our Terms & Privacy Policy
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import {
  Moon, Sun, Monitor, ShieldCheck, KeyRound, Fingerprint,
  Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ChevronRight,
  Smartphone, Trash2, LogOut, Bell, Lock, Palette, User,
} from "lucide-react";

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border/40">{children}</div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40
        ${checked ? "bg-primary" : "bg-white/10"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
        ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Change Password form ─────────────────────────────────────────────────────
function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { setStatus("error"); setMsg("New passwords do not match."); return; }
    if (next.length < 8) { setStatus("error"); setMsg("Password must be at least 8 characters."); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("success"); setMsg("Password updated successfully.");
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => { setStatus("idle"); setMsg(""); setOpen(false); }, 2000);
    } catch (err: any) {
      setStatus("error"); setMsg(err.message || "Failed to update password.");
    }
  };

  const PwInput = ({ label, value, onChange, show, onToggle, autoComplete }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="w-full h-10 px-3 pr-10 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="px-6 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Password</p>
          <p className="text-xs text-muted-foreground mt-0.5">Change your login password</p>
        </div>
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
          {open ? "Cancel" : "Change"} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-3 overflow-hidden"
          >
            <PwInput label="Current Password" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(s => !s)} autoComplete="current-password" />
            <PwInput label="New Password" value={next} onChange={setNext} show={showNext} onToggle={() => setShowNext(s => !s)} autoComplete="new-password" />
            <PwInput label="Confirm New Password" value={confirm} onChange={setConfirm} show={showNext} onToggle={() => setShowNext(s => !s)} autoComplete="new-password" />

            {msg && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${status === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {status === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} {msg}
              </div>
            )}

            <button type="submit" disabled={status === "loading" || status === "success"}
              className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60">
              {status === "loading" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…</> : "Update Password"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Passkey / Biometrics ─────────────────────────────────────────────────────
function PasskeySection() {
  const [state, setState] = useState<"idle" | "registering" | "success" | "error" | "unsupported">("idle");
  const [msg, setMsg] = useState("");
  const [passkeys, setPasskeys] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("passkeys") || "[]"); } catch { return []; }
  });

  const supported = typeof window !== "undefined" && !!window.PublicKeyCredential;

  const registerPasskey = async () => {
    if (!supported) { setState("unsupported"); return; }
    setState("registering");
    try {
      // Fetch challenge from backend
      const optRes = await fetch("/api/auth/passkey/register/options", {
        method: "POST",
        credentials: "include",
      });
      const opts = await optRes.json();
      if (!optRes.ok) throw new Error(opts.error);

      // Call browser biometric API — triggers fingerprint / Face ID natively
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(opts.challenge), c => c.charCodeAt(0)),
          rp: { name: "Social Connect", id: window.location.hostname },
          user: {
            id: Uint8Array.from(opts.userId, c => c.charCodeAt(0)),
            name: opts.userEmail || "user@socialconnect.app",
            displayName: opts.userName || "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },   // ES256
            { alg: -257, type: "public-key" },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // device biometrics only
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential;

      // Send to backend to store
      const response = credential.response as AuthenticatorAttestationResponse;
      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
        }),
      });

      const result = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(result.error);

      const label = `${getDeviceName()} · ${new Date().toLocaleDateString()}`;
      const updated = [...passkeys, label];
      localStorage.setItem("passkeys", JSON.stringify(updated));
      setPasskeys(updated);
      setState("success");
      setMsg("Biometric login enabled!");
      setTimeout(() => setState("idle"), 3000);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setState("error"); setMsg("Biometric authentication was cancelled.");
      } else {
        setState("error"); setMsg(err.message || "Could not register biometrics.");
      }
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const removePasskey = (idx: number) => {
    const updated = passkeys.filter((_, i) => i !== idx);
    localStorage.setItem("passkeys", JSON.stringify(updated));
    setPasskeys(updated);
  };

  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return "iPhone (Face ID / Touch ID)";
    if (/iPad/.test(ua)) return "iPad (Face ID / Touch ID)";
    if (/Mac/.test(ua)) return "Mac (Touch ID)";
    if (/Android/.test(ua)) return "Android (Fingerprint)";
    return "This Device";
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" /> Passkeys & Biometrics
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sign in with fingerprint, Face ID, or Windows Hello — no password needed
          </p>
        </div>
      </div>

      {/* Registered passkeys */}
      {passkeys.length > 0 && (
        <div className="space-y-2">
          {passkeys.map((pk, i) => (
            <div key={i} className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5 group">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">{pk}</p>
                  <p className="text-[10px] text-muted-foreground">Active · Verified</p>
                </div>
              </div>
              <button onClick={() => removePasskey(i)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status messages */}
      <AnimatePresence>
        {(state === "success" || state === "error") && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${state === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {state === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {!supported ? (
        <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
          Your browser doesn't support passkeys. Try Chrome, Safari, or Edge.
        </p>
      ) : (
        <button
          onClick={registerPasskey}
          disabled={state === "registering"}
          className="w-full h-9 rounded-xl border border-primary/30 bg-primary/8 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/15 disabled:opacity-60 transition-colors"
        >
          {state === "registering"
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Waiting for biometric…</>
            : <><Fingerprint className="w-3.5 h-3.5" /> Add {passkeys.length > 0 ? "Another " : ""}Passkey</>
          }
        </button>
      )}
    </div>
  );
}

// ─── Theme Selector ───────────────────────────────────────────────────────────
function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div className="flex gap-2">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all
            ${theme === value
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-white/3"
            }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true });
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, security, and preferences.</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <div className="px-6 py-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Theme</p>
            <p className="text-xs text-muted-foreground mb-3">Choose between light and dark mode, or follow your system.</p>
            <ThemeSelector />
          </div>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account" icon={User}>
        <Row label="Name" description={user?.name || "—"}>
          <span className="text-xs text-muted-foreground">Profile → Edit</span>
        </Row>
        <Row label="Email" description={user?.email || "—"}>
          <span className="text-xs text-muted-foreground">Verified</span>
        </Row>
        <Row label="Member since" description={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}>
          <span />
        </Row>
      </Section>

      {/* Security */}
      <Section title="Security" icon={ShieldCheck}>
        {/* Change password */}
        <ChangePasswordForm />

        {/* Passkeys */}
        <div className="border-t border-border/40">
          <PasskeySection />
        </div>

        {/* 2FA */}
        <Row
          label="Two-Factor Authentication"
          description="Get a code by SMS or authenticator app when you sign in"
        >
          <Toggle checked={twoFactor} onChange={setTwoFactor} />
        </Row>

        {/* Login alerts */}
        <Row
          label="Login Alerts"
          description="Get notified by email when a new device signs in"
        >
          <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
        </Row>

        {/* Session */}
        <Row label="Current Session" description="Your active login session">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:opacity-80 transition-opacity"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Row label="Email Notifications" description="Publish confirmations, weekly digest">
          <Toggle checked={notifications.email} onChange={v => setNotifications(n => ({ ...n, email: v }))} />
        </Row>
        <Row label="Push Notifications" description="Real-time alerts in your browser">
          <Toggle checked={notifications.push} onChange={v => setNotifications(n => ({ ...n, push: v }))} />
        </Row>
        <Row label="Weekly Performance Report" description="Summary of your top posts every Monday">
          <Toggle checked={notifications.weekly} onChange={v => setNotifications(n => ({ ...n, weekly: v }))} />
        </Row>
      </Section>

      {/* Privacy & Data */}
      <Section title="Privacy & Data" icon={Lock}>
        <Row label="Download Your Data" description="Get a copy of all your content and analytics">
          <button className="text-xs font-medium text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
            Download <ChevronRight className="w-3 h-3" />
          </button>
        </Row>
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all data</p>
            </div>
            <button onClick={() => setDeleteConfirm(d => !d)} className="text-xs font-medium text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
              {deleteConfirm ? "Cancel" : "Delete"}
            </button>
          </div>

          <AnimatePresence>
            {deleteConfirm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-destructive font-medium">Are you absolutely sure?</p>
                  <p className="text-xs text-muted-foreground">This will permanently delete your account, all posts, and connected platforms. This action cannot be undone.</p>
                  <button className="w-full h-9 rounded-xl bg-destructive text-white text-sm font-medium hover:opacity-90">
                    Yes, delete my account permanently
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* App info */}
      <div className="text-center text-xs text-muted-foreground/40 space-y-1">
        <p>Social Connect · Version 1.0.0</p>
        <p>All data encrypted · OAuth 2.0 · bcrypt</p>
      </div>
    </motion.div>
  );
}

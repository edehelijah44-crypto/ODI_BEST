import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenSquare, FileText, Share2, BarChart3, User, LogOut, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Post", icon: PenSquare },
  { href: "/posts", label: "Posts", icon: FileText },
  { href: "/platforms", label: "Platforms", icon: Share2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/pricing", label: "Pricing & Plans", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-screen border-r border-border/50 bg-card/60 backdrop-blur-2xl flex flex-col hidden md:flex fixed left-0 top-0 z-50 shadow-xl shadow-black/10">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent p-[1.5px] shadow-md shadow-primary/20">
          <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-5 h-5 object-contain" />
          </div>
        </div>
        <span className="font-display font-bold text-lg text-gradient">Social Connect</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative overflow-hidden text-sm",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/4"
            )}>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/6 to-transparent rounded-xl border border-primary/15" />
              )}
              <item.icon className={cn(
                "w-4 h-4 relative z-10 transition-transform group-hover:scale-105 shrink-0",
                isActive ? "text-primary" : ""
              )} />
              <span className={cn("font-medium relative z-10", isActive ? "" : "")}>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary relative z-10" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border/40 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{(user.name || "U")[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 w-full transition-colors text-sm group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-105 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

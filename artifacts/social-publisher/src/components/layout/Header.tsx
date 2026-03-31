import { Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search posts, analytics, platforms..." 
          className="pl-10 bg-white/5 border-white/10 rounded-full h-10"
        />
      </div>

      <div className="flex items-center gap-6 ml-auto">
        <button className="relative text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user?.name || "Creator"}</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
          <img 
            src={user?.avatar || `${import.meta.env.BASE_URL}images/avatar-placeholder.png`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
          />
        </div>
      </div>
    </header>
  );
}

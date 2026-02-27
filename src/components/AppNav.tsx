import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Bell, Plus, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AppNav() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => setUnread(count ?? 0));
  }, [user, location]);

  if (!user) return null;

  const navItems = [
    { to: "/", icon: Heart, label: "Feed" },
    { to: "/create", icon: Plus, label: "Post" },
    { to: "/dashboard", icon: BarChart3, label: "Mood" },
    { to: "/notifications", icon: Bell, label: "Alerts", badge: unread },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
          <Heart className="h-5 w-5 text-primary" />
          SafeSpace
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <Button variant={active ? "default" : "ghost"} size="sm" className="relative gap-1.5">
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </Button>
              </Link>
            );
          })}
          <Button variant="ghost" size="sm" onClick={signOut} className="ml-2">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChatSocket } from "@/context/ChatSocketContext";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/my-sessions", label: "Sessions" },
  { to: "/my-slots", label: "Slots" },
  { to: "/chat", label: "Chat" },
];

export function AppNavbar() {
  const { user, logout } = useAuth();
  const { totalUnread } = useChatSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const appLinks = user?.is_admin
    ? [...baseLinks, { to: "/admin", label: "Admin" }]
    : baseLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-bold text-lg tracking-tight">SkillSwap</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {appLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-foreground"
                )
              }
            >
              {link.label}
              {link.to === "/chat" && totalUnread > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] font-bold leading-none">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to={`/profile/${user.id}`}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-foreground"
                )
              }
            >
              Profile
            </NavLink>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
              {user.credits} <span className="text-muted-foreground">CREDITS</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 px-6 py-4 flex flex-col gap-1 bg-background/90">
          {appLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground flex items-center justify-between",
                  isActive && "text-foreground"
                )
              }
            >
              <span>{link.label}</span>
              {link.to === "/chat" && totalUnread > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] font-bold leading-none">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink
                to={`/profile/${user.id}`}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
              >
                Profile
              </NavLink>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/40">
                <span className="text-xs text-muted-foreground">
                  {user.credits} credits
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

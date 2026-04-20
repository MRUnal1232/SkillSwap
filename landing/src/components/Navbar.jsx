import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";

const navLinks = ["Home", "How It Works", "Philosophy", "Use Cases"];

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 md:px-28 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-bold text-lg tracking-tight">SkillSwap</span>
          </Link>
          <div className="hidden md:flex items-center gap-3 text-sm">
            {navLinks.map((link, i) => (
              <div key={link} className="flex items-center gap-3">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link}
                </a>
                {i < navLinks.length - 1 && (
                  <span className="text-muted-foreground/40">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-1">
            {user ? (
              <Link
                to="/marketplace"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
              >
                Open App →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-foreground text-background rounded-full px-5 py-2 hover:bg-foreground/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
          {[Instagram, Linkedin, Twitter].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
              aria-label="social link"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

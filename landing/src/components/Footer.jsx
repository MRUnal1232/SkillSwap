export function Footer() {
  return (
    <footer className="py-12 px-8 md:px-28 border-t border-border/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          © 2026 SkillSwap. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm">
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

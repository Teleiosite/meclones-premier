import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/primary", label: "Primary" },
  { to: "/secondary", label: "Secondary" },
  { to: "/about", label: "About" },
  { to: "/admissions", label: "Admissions" },
  { to: "/fees", label: "Fees" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-navy text-white border-b border-white/10">
      <div className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold flex items-center justify-center text-navy font-black text-sm">M</div>
          <span className="font-bold tracking-wide text-sm">MECLONES ACADEMY</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[13px] font-medium transition-colors ${isActive ? "text-gold" : "text-white/75 hover:text-white"}`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/admissions"
            className="hidden sm:inline-flex bg-gold text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-gold/90 transition"
          >
            APPLY →
          </Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-navy">
          <div className="container-page py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `py-2 text-sm font-medium ${isActive ? "text-gold" : "text-white/80"}`
                }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/admissions" className="mt-3 bg-gold text-navy px-4 py-3 text-xs font-bold tracking-wider text-center">
              APPLY NOW →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, ReactNode } from "react";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import CompleteProfileModal from "./CompleteProfileModal";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface Props {
  role: string;
  userName: string;
  userMeta: string;
  nav: NavItem[];
}

export default function DashboardLayout({ role, userName, userMeta, nav }: Props) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-cream">
      <CompleteProfileModal role={role} />
      
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-navy text-white flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gold flex items-center justify-center text-navy font-black">M</div>
            <div>
              <div className="font-bold text-xs tracking-wide leading-tight">MECLONES GROUP OF SCHOOLS</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">{role} portal</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-gold text-navy"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-gold"
          >
            <LogOut size={18} /> Logout
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-8 h-16">
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-navy">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-navy">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="w-9 h-9 bg-navy text-gold flex items-center justify-center font-bold text-sm">
                  {userName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-navy leading-tight">{userName}</div>
                  <div className="text-[11px] text-muted-foreground">{userMeta}</div>
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

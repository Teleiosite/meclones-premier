import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="container-page py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-gold flex items-center justify-center text-navy font-black text-sm">M</div>
            <span className="font-bold tracking-wide text-sm">MECLONES GROUP OF SCHOOLS</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Two decades of nurturing brilliant minds — from Nursery through SS3.
          </p>
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.25em] text-gold mb-4">EXPLORE</div>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link to="/primary" className="hover:text-white">Primary School</Link></li>
            <li><Link to="/secondary" className="hover:text-white">Secondary School</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/news" className="hover:text-white">News & Events</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.25em] text-gold mb-4">PARENTS</div>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link to="/admissions" className="hover:text-white">Admissions</Link></li>
            <li><Link to="/fees" className="hover:text-white">Fee Payment</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.25em] text-gold mb-4">CONTACT</div>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2.5"><MapPin size={16} className="text-gold mt-0.5 shrink-0" /> 24 Education Avenue, Lagos</li>
            <li className="flex gap-2.5"><Phone size={16} className="text-gold mt-0.5 shrink-0" /> +234 800 000 0000</li>
            <li className="flex gap-2.5"><Mail size={16} className="text-gold mt-0.5 shrink-0" /> hello@meclones.edu</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
          <div>© {new Date().getFullYear()} Meclones Group of Schools. All rights reserved.</div>
          <div>Excellence · Character · Service</div>
        </div>
      </div>
    </footer>
  );
}

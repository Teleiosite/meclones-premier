import { Link } from "react-router-dom";

export default function MobileStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-navy border-t border-white/10 flex">
      <Link
        to="/admissions"
        className="flex-1 bg-gold text-navy text-center py-4 text-xs font-black tracking-widest hover:bg-gold/90 transition"
      >
        APPLY NOW
      </Link>
      <Link
        to="/fees"
        className="flex-1 text-white text-center py-4 text-xs font-black tracking-widest hover:bg-white/10 transition border-l border-white/10"
      >
        PAY FEES
      </Link>
    </div>
  );
}

import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "navy" | "gold" | "green" | "purple" | "orange";
}

const tones: Record<string, string> = {
  navy: "bg-navy/10 text-navy",
  gold: "bg-gold/20 text-navy",
  green: "bg-emerald-100 text-emerald-700",
  purple: "bg-violet-100 text-violet-700",
  orange: "bg-orange-100 text-orange-700",
};

export default function StatCard({ icon, label, value, hint, tone = "navy" }: Props) {
  return (
    <div className="bg-white border border-border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="font-display font-black text-2xl text-navy leading-tight">{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

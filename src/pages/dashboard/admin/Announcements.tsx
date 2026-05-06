import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

const existing = [
  { title: "Midterm Exam Schedule Released", audience: "All", date: "May 28, 2026", body: "Midterm exams begin June 10. Please check the timetable page for full details.", by: "Admin" },
  { title: "PTA Meeting — June 5", audience: "Parents", date: "May 25, 2026", body: "The next PTA meeting is scheduled for Saturday June 5 at 10:00 AM in the school hall.", by: "Admin" },
  { title: "Sports Day Registration Open", audience: "Students", date: "May 20, 2026", body: "Sign up for Sports Day 2026 events via your class teacher. Deadline: June 1.", by: "Admin" },
  { title: "New Science Lab Now Open", audience: "All", date: "Aug 12, 2025", body: "The newly renovated science block is now open for use. All SS science classes will begin rotating.", by: "Admin" },
];

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Announcement sent to ${audience}.`);
    setTitle(""); setBody(""); setAudience("All");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Announcements</h1>
        <p className="text-muted-foreground text-sm">Post notices to students, parents, or teachers.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2 bg-white border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Megaphone size={20} className="text-gold" />
            <h3 className="font-bold text-navy">New Announcement</h3>
          </div>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">SEND TO</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white text-navy">
                {["All", "Students", "Parents", "Teachers", "Primary Only", "Secondary Only"].map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">TITLE</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" placeholder="Announcement title..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">MESSAGE</label>
              <textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)} className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy resize-none" placeholder="Write your announcement..." />
            </div>
            <button type="submit" className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition flex items-center justify-center gap-2">
              <Send size={14} /> SEND ANNOUNCEMENT
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-navy">Recent Announcements</h3>
          {existing.map((a, i) => (
            <div key={i} className="bg-white border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-bold text-navy">{a.title}</h4>
                <span className="text-[10px] font-bold bg-navy/10 text-navy px-2 py-0.5 shrink-0">{a.audience}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{a.body}</p>
              <div className="text-[11px] text-muted-foreground">Posted by {a.by} · {a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

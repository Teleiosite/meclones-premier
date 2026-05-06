import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const inbox = [
  { id: 1, from: "Mr. Daniel Marko", role: "Mathematics Teacher", subject: "Well done on your test!", time: "1 hour ago", read: false, body: "David, I wanted to personally congratulate you on scoring 88% in the recent mathematics test. Keep up the great work!" },
  { id: 2, from: "Admin", role: "School Administration", subject: "Midterm exam timetable", time: "Yesterday", read: false, body: "The midterm exam timetable has been released. Please log in to your timetable page to see the full schedule starting June 10." },
  { id: 3, from: "Mrs. Sarah James", role: "English Teacher", subject: "Essay submission reminder", time: "2 days ago", read: true, body: "Please remember your English essay on 'The Future of Africa' is due June 2. Submit via the assignments portal." },
];

export default function StudentMessages() {
  const [selected, setSelected] = useState<(typeof inbox)[0] | null>(inbox[0]);
  const [reply, setReply] = useState("");

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent.");
    setReply("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Messages</h1>
        <p className="text-muted-foreground text-sm">Messages from your teachers and school admin.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-h-[450px]">
        <div className="bg-white border border-border divide-y divide-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="font-bold text-navy text-sm">Inbox</span>
            <span className="bg-navy text-gold text-[10px] font-bold px-2 py-0.5">{inbox.filter(m => !m.read).length} NEW</span>
          </div>
          {inbox.map((m) => (
            <button key={m.id} onClick={() => setSelected(m)}
              className={`w-full text-left px-4 py-4 transition ${selected?.id === m.id ? "bg-navy/5 border-l-4 border-navy" : "hover:bg-secondary/40"}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-gold/20 text-navy flex items-center justify-center text-xs font-bold shrink-0">{m.from[0]}</div>
                <div className="min-w-0">
                  <div className={`text-xs truncate ${!m.read ? "font-bold text-navy" : "text-muted-foreground"}`}>{m.from}</div>
                  <div className="text-[10px] text-muted-foreground">{m.time}</div>
                </div>
              </div>
              <div className={`text-xs truncate mt-1 ${!m.read ? "text-navy" : "text-muted-foreground"}`}>{m.subject}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white border border-border flex flex-col">
          {selected ? (
            <>
              <div className="px-6 py-5 border-b border-border">
                <h3 className="font-bold text-navy text-lg">{selected.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selected.from} · {selected.role} · {selected.time}</p>
              </div>
              <div className="px-6 py-5 flex-1 text-navy/80 leading-relaxed">{selected.body}</div>
              <div className="px-6 py-5 border-t border-border">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input required value={reply} onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply to your teacher..."
                    className="flex-1 border border-border px-4 py-2.5 text-sm focus:border-navy focus:outline-none text-navy" />
                  <button type="submit" className="bg-navy text-gold px-5 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2">
                    <Send size={14} /> SEND
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a message</div>
          )}
        </div>
      </div>
    </div>
  );
}

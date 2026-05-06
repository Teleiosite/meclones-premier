import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const inbox = [
  { id: 1, from: "Mrs. Adeyemi (Parent)", subject: "David's performance in Maths", time: "10 min ago", read: false, body: "Good morning sir. I wanted to check in on David's progress in Mathematics this term. He mentioned the topics are getting more challenging." },
  { id: 2, from: "Admin", subject: "Term 3 timetable update", time: "2 hours ago", read: false, body: "Please note that the timetable for Term 3 has been updated. Kindly check the timetable section for your revised schedule." },
  { id: 3, from: "Mr. Johnson (Parent)", subject: "Daniel struggling with algebra", time: "1 day ago", read: true, body: "Hello Mr. Marko, Daniel has been having difficulty with the algebra topic. Would it be possible to arrange extra support for him?" },
  { id: 4, from: "Mrs. Okoro (Parent)", subject: "Blessing's exam prep", time: "2 days ago", read: true, body: "Sir, thank you for the extra revision sessions. Blessing is feeling much more confident ahead of the exams." },
];

export default function TeacherMessages() {
  const [selected, setSelected] = useState<(typeof inbox)[0] | null>(inbox[0]);
  const [reply, setReply] = useState("");

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Reply sent.");
    setReply("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Messages</h1>
        <p className="text-muted-foreground text-sm">Communications from parents and school admin.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-h-[500px]">
        <div className="bg-white border border-border divide-y divide-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="font-bold text-navy text-sm">Inbox</span>
            <span className="bg-navy text-gold text-[10px] font-bold px-2 py-0.5">{inbox.filter(m => !m.read).length} NEW</span>
          </div>
          {inbox.map((m) => (
            <button key={m.id} onClick={() => setSelected(m)}
              className={`w-full text-left px-4 py-4 transition ${selected?.id === m.id ? "bg-navy/5 border-l-4 border-navy" : "hover:bg-secondary/40"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${!m.read ? "font-bold text-navy" : "text-muted-foreground"}`}>{m.from}</span>
                <span className="text-[10px] text-muted-foreground">{m.time}</span>
              </div>
              <div className={`text-xs truncate ${!m.read ? "text-navy" : "text-muted-foreground"}`}>{m.subject}</div>
              {!m.read && <span className="inline-block mt-1 w-2 h-2 bg-gold rounded-full" />}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white border border-border flex flex-col">
          {selected ? (
            <>
              <div className="px-6 py-5 border-b border-border">
                <h3 className="font-bold text-navy text-lg">{selected.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">From: {selected.from} · {selected.time}</p>
              </div>
              <div className="px-6 py-5 flex-1 text-navy/80 leading-relaxed">{selected.body}</div>
              <div className="px-6 py-5 border-t border-border">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input required value={reply} onChange={(e) => setReply(e.target.value)}
                    placeholder="Write your reply..."
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

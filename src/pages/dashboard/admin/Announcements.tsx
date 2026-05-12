import { useState, useEffect, useCallback } from "react";
import { Megaphone, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

const AUDIENCES = ["All", "Students", "Parents", "Teachers", "Primary Only", "Secondary Only"];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [audience, setAudience] = useState("All");

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) { toast.error("Failed to load announcements."); }
    else { setAnnouncements(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("announcements").insert({
      title,
      body,
      audience,
      created_by: user?.id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Announcement sent to ${audience}.`);
      setTitle(""); setBody(""); setAudience("All");
      fetchAnnouncements();
    }

    setSending(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

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
              <select value={audience} onChange={(e) => setAudience(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white text-navy">
                {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">TITLE</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy"
                placeholder="Announcement title..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">MESSAGE</label>
              <textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy resize-none"
                placeholder="Write your announcement..." />
            </div>
            <button type="submit" disabled={sending}
              className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? "SENDING..." : "SEND ANNOUNCEMENT"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-navy">Recent Announcements</h3>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white border border-border p-8 text-center text-sm text-muted-foreground">
              No announcements yet. Send your first one!
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="bg-white border border-border p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-bold text-navy">{a.title}</h4>
                  <span className="text-[10px] font-bold bg-navy/10 text-navy px-2 py-0.5 shrink-0">{a.audience}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{a.body}</p>
                <div className="text-[11px] text-muted-foreground">
                  Posted by {a.profiles?.full_name ?? "Admin"} · {formatDate(a.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

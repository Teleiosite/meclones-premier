import { useState, useEffect, useCallback } from "react";
import { Send, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  id: string;
  from: string;
  from_role: string;
  sender_id: string;
  subject_preview: string;
  body: string;
  time: string;
  read: boolean;
};

type Contact = {
  id: string;
  full_name: string;
  role: string;
};

const formatTime = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

export default function TeacherMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id, body, read, created_at, sender_id,
        sender:profiles!messages_sender_id_fkey ( full_name, role )
      `)
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) { toast.error("Failed to load messages."); setLoading(false); return; }

    const mapped: Message[] = (data || []).map((m: any) => ({
      id:             m.id,
      from:           m.sender?.full_name ?? "Unknown",
      from_role:      m.sender?.role ?? "—",
      sender_id:      m.sender_id,
      subject_preview: m.body.slice(0, 60) + (m.body.length > 60 ? "…" : ""),
      body:           m.body,
      time:           formatTime(m.created_at),
      read:           m.read,
    }));
    setMessages(mapped);
    if (mapped.length > 0 && !selected) setSelected(mapped[0]);
    setLoading(false);
  }, [user]);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    // Teachers can message parents and admins
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["parent", "admin"])
      .neq("id", user.id);

    setContacts((data || []).map((p: any) => ({
      id: p.id, full_name: p.full_name, role: p.role,
    })));
  }, [user]);

  useEffect(() => { fetchMessages(); fetchContacts(); }, [fetchMessages, fetchContacts]);

  const markRead = async (msgId: string) => {
    await supabase.from("messages").update({ read: true }).eq("id", msgId);
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, read: true } : m));
  };

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    setReplyBody("");
    if (!msg.read) markRead(msg.id);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !selected || !user) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      sender_id:   user.id,
      receiver_id: selected.sender_id,
      body:        replyBody.trim(),
    });

    if (error) toast.error("Failed to send reply.");
    else { toast.success("Reply sent."); setReplyBody(""); }
    setSending(false);
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeBody.trim() || !composeTo || !user) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      sender_id:   user.id,
      receiver_id: composeTo,
      body:        composeBody.trim(),
    });

    if (error) toast.error("Failed to send message.");
    else { toast.success("Message sent."); setComposeBody(""); setComposeTo(""); setShowCompose(false); }
    setSending(false);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Messages</h1>
          <p className="text-muted-foreground text-sm">Communications from parents and school admin.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMessages} className="border border-border p-2 hover:bg-secondary transition" title="Refresh">
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2"
          >
            <Send size={14} /> NEW MESSAGE
          </button>
        </div>
      </div>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-bold text-navy text-lg mb-4">New Message</h2>
            <form onSubmit={handleCompose} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To</label>
                <select
                  required value={composeTo} onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full mt-1 border border-border px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
                >
                  <option value="">— Select recipient —</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                <textarea
                  required value={composeBody} onChange={(e) => setComposeBody(e.target.value)}
                  rows={4} placeholder="Write your message..."
                  className="w-full mt-1 border border-border px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={sending}
                  className="flex-1 bg-navy text-gold py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} SEND
                </button>
                <button type="button" onClick={() => setShowCompose(false)}
                  className="px-5 border border-border text-navy text-xs font-bold hover:bg-secondary transition">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 min-h-[500px]">
        <div className="bg-white border border-border divide-y divide-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="font-bold text-navy text-sm">Inbox</span>
            {unreadCount > 0 && (
              <span className="bg-navy text-gold text-[10px] font-bold px-2 py-0.5">{unreadCount} NEW</span>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          ) : messages.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((m) => (
              <button key={m.id} onClick={() => handleSelect(m)}
                className={`w-full text-left px-4 py-4 transition ${selected?.id === m.id ? "bg-navy/5 border-l-4 border-navy" : "hover:bg-secondary/40"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${!m.read ? "font-bold text-navy" : "text-muted-foreground"}`}>{m.from}</span>
                  <span className="text-[10px] text-muted-foreground">{m.time}</span>
                </div>
                <div className={`text-xs truncate ${!m.read ? "text-navy" : "text-muted-foreground"}`}>{m.subject_preview}</div>
                {!m.read && <span className="inline-block mt-1 w-2 h-2 bg-gold rounded-full" />}
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-border flex flex-col">
          {selected ? (
            <>
              <div className="px-6 py-5 border-b border-border">
                <p className="text-sm text-muted-foreground">From: {selected.from} ({selected.from_role}) · {selected.time}</p>
              </div>
              <div className="px-6 py-5 flex-1 text-navy/80 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
              <div className="px-6 py-5 border-t border-border">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input required value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 border border-border px-4 py-2.5 text-sm focus:border-navy focus:outline-none text-navy" />
                  <button type="submit" disabled={sending}
                    className="bg-navy text-gold px-5 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} SEND
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a message</div>
          )}
        </div>
      </div>
    </div>
  );
}

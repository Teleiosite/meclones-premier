import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Loader2, RefreshCcw, Search, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type ProfileInfo = {
  id: string;
  full_name: string;
  role: string;
};

type DbMessage = {
  id: string;
  body: string;
  read: boolean;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender: ProfileInfo | null;
  receiver: ProfileInfo | null;
};

type ChatPartner = {
  id: string;
  full_name: string;
  role: string;
  lastMessage: string;
  time: string;
  timestamp: number;
  unreadCount: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [allDbMessages, setAllDbMessages] = useState<DbMessage[]>([]);
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ProfileInfo[]>([]);
  
  // Controls
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to bottom of active thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all messages (Incoming and Outgoing) and build conversation list
  const fetchMessagesAndConversations = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id, body, read, created_at, sender_id, receiver_id,
        sender:profiles!messages_sender_id_fkey ( id, full_name, role ),
        receiver:profiles!messages_receiver_id_fkey ( id, full_name, role )
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load messages.");
      setLoading(false);
      return;
    }

    const messagesList: DbMessage[] = (data || []).map((m: any) => ({
      id: m.id,
      body: m.body,
      read: m.read,
      created_at: m.created_at,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      sender: Array.isArray(m.sender) ? m.sender[0] : m.sender,
      receiver: Array.isArray(m.receiver) ? m.receiver[0] : m.receiver,
    }));

    setAllDbMessages(messagesList);

    // Group in memory to build conversations
    const partnersMap: Record<string, {
      profile: ProfileInfo;
      messages: DbMessage[];
    }> = {};

    messagesList.forEach((m) => {
      const isSent = m.sender_id === user.id;
      const partner = isSent ? m.receiver : m.sender;

      if (!partner) return;

      if (!partnersMap[partner.id]) {
        partnersMap[partner.id] = {
          profile: partner,
          messages: [],
        };
      }
      partnersMap[partner.id].messages.push(m);
    });

    const conversationList: ChatPartner[] = Object.entries(partnersMap).map(([id, group]) => {
      // Since messages are ordered descending, group.messages[0] is the most recent
      const lastMsg = group.messages[0];
      const unreadCount = group.messages.filter(m => m.receiver_id === user.id && !m.read).length;

      return {
        id,
        full_name: group.profile.full_name || "Unknown User",
        role: group.profile.role || "User",
        lastMessage: lastMsg.body,
        time: formatTime(lastMsg.created_at),
        timestamp: new Date(lastMsg.created_at).getTime(),
        unreadCount,
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    setConversations(conversationList);
    
    // Auto-select first conversation if none selected yet
    if (conversationList.length > 0 && !selectedPartnerId && !showCompose) {
      setSelectedPartnerId(conversationList[0].id);
    }

    if (!silent) setLoading(false);
  }, [user, selectedPartnerId, showCompose]);

  // Fetch all potential contacts for new messaging (Admins, Parents, Students)
  const fetchContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["parent", "admin", "student"])
      .neq("id", user.id)
      .order("full_name", { ascending: true });

    setContacts((data || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || "Unknown",
      role: p.role,
    })));
  }, [user]);

  // Mark all unread messages from current partner as read
  const markAsRead = async (partnerId: string) => {
    if (!user) return;
    const unreadIds = allDbMessages
      .filter(m => m.sender_id === partnerId && m.receiver_id === user.id && !m.read)
      .map(m => m.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_id", user.id)
      .eq("sender_id", partnerId);

    // Update local state instantly for seamless UI response
    setAllDbMessages((prev) =>
      prev.map((m) =>
        m.sender_id === partnerId && m.receiver_id === user.id ? { ...m, read: true } : m
      )
    );
    setConversations((prev) =>
      prev.map((c) => (c.id === partnerId ? { ...c, unreadCount: 0 } : c))
    );
  };

  useEffect(() => {
    fetchMessagesAndConversations();
    fetchContacts();
  }, [fetchMessagesAndConversations, fetchContacts]);

  // Auto scroll to bottom when chat thread or message count changes
  useEffect(() => {
    scrollToBottom();
    if (selectedPartnerId) {
      markAsRead(selectedPartnerId);
    }
  }, [selectedPartnerId, allDbMessages.length]);

  // Send a quick reply inside the active thread
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !selectedPartnerId || !user) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedPartnerId,
      body: replyBody.trim(),
    });

    if (error) {
      toast.error("Failed to send reply.");
    } else {
      setReplyBody("");
      // Silent refresh to update active bubbles immediately
      await fetchMessagesAndConversations(true);
    }
    setSending(false);
  };

  // Start a completely new message thread
  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeBody.trim() || !composeTo || !user) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: composeTo,
      body: composeBody.trim(),
    });

    if (error) {
      toast.error("Failed to send message.");
    } else {
      toast.success("Message sent successfully!");
      setComposeBody("");
      setSelectedPartnerId(composeTo);
      setComposeTo("");
      setShowCompose(false);
      await fetchMessagesAndConversations(false);
    }
    setSending(false);
  };

  // Filter conversations list by search query
  const filteredConversations = conversations.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter messages to build the active bubbles thread (Ascending chronological order)
  const activeThread = allDbMessages
    .filter(
      (m) =>
        (m.sender_id === user?.id && m.receiver_id === selectedPartnerId) ||
        (m.sender_id === selectedPartnerId && m.receiver_id === user?.id)
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const selectedPartner = conversations.find(c => c.id === selectedPartnerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Messages</h1>
          <p className="text-muted-foreground text-sm">Threaded school communications — Parents, Admins, and Students.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchMessagesAndConversations()} 
            className="border border-border p-2.5 hover:bg-secondary transition bg-white" 
            title="Refresh Chats"
          >
            <RefreshCcw size={16} className="text-navy" />
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="bg-navy text-gold px-4 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2"
          >
            <Plus size={16} /> NEW CONVERSATION
          </button>
        </div>
      </div>

      {/* New Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md p-6 shadow-2xl rounded-lg">
            <h2 className="font-bold text-navy text-lg mb-4 flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare size={20} className="text-navy" /> Start New Conversation
            </h2>
            <form onSubmit={handleCompose} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-navy tracking-wider uppercase">TO RECIPIENT</label>
                <select
                  required 
                  value={composeTo} 
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full mt-1 border border-border px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none bg-white font-semibold"
                >
                  <option value="">— Select school contact —</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-navy tracking-wider uppercase">MESSAGE BODY</label>
                <textarea
                  required 
                  value={composeBody} 
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={4} 
                  placeholder="Write your initial message..."
                  className="w-full mt-1 border border-border px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none resize-none bg-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={sending}
                  className="flex-1 bg-navy text-gold py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} SEND MESSAGE
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCompose(false)}
                  className="px-5 border border-border text-navy text-xs font-bold hover:bg-secondary transition"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Chats List & Active Bubbles thread */}
      <div className="grid lg:grid-cols-3 gap-6 min-h-[550px] bg-white border border-border rounded-lg overflow-hidden shadow-sm">
        
        {/* Left Side: Conversations List */}
        <div className="border-r border-border flex flex-col bg-secondary/5">
          <div className="p-4 border-b border-border bg-white flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={15} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-border focus:border-navy focus:outline-none bg-secondary/25"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-16 text-center text-xs text-muted-foreground">
                No active conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedPartnerId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedPartnerId(c.id); setShowCompose(false); }}
                    className={`w-full text-left px-4 py-4 transition flex gap-3 relative ${
                      isSelected ? "bg-navy/5 border-l-4 border-navy" : "hover:bg-secondary/40"
                    }`}
                  >
                    {/* Circle Initial Badge */}
                    <div className="w-9 h-9 rounded-full bg-navy text-gold flex items-center justify-center text-sm font-bold shrink-0">
                      {c.full_name[0].toUpperCase()}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-xs truncate font-bold ${c.unreadCount > 0 ? "text-navy" : "text-navy/85"}`}>
                          {c.full_name}
                        </span>
                        <span className="text-[9px] text-muted-foreground shrink-0">{c.time}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className={`text-[11px] truncate ${c.unreadCount > 0 ? "font-bold text-navy/95" : "text-muted-foreground"}`}>
                          {c.lastMessage}
                        </p>
                        <span className="text-[9px] uppercase tracking-wider bg-secondary px-1.5 py-0.5 font-bold text-muted-foreground rounded ml-2 shrink-0">
                          {c.role}
                        </span>
                      </div>
                    </div>

                    {/* Unread Message Indicator Badge */}
                    {c.unreadCount > 0 && (
                      <span className="absolute top-4 right-4 bg-gold text-navy text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Bubbles Chronological Thread */}
        <div className="lg:col-span-2 flex flex-col bg-white">
          {selectedPartner ? (
            <>
              {/* Active Conversation Partner Header Info */}
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/10">
                <div>
                  <h3 className="font-bold text-navy text-sm">{selectedPartner.full_name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-0.5">
                    {selectedPartner.role}
                  </p>
                </div>
              </div>

              {/* Chat Messages scroll container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-4 max-h-[420px] bg-secondary/5"
              >
                {activeThread.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div className={`max-w-[70%] rounded-lg px-4 py-2.5 text-xs shadow-sm ${
                        isOwn 
                          ? "bg-navy text-white rounded-br-none" 
                          : "bg-white border border-border text-navy rounded-bl-none"
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={`text-[8px] text-right mt-1.5 opacity-60 font-mono`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Typing Panel */}
              <div className="px-6 py-4 border-t border-border bg-white">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    required 
                    value={replyBody} 
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Reply to ${selectedPartner.full_name}...`}
                    className="flex-1 border border-border px-4 py-2.5 text-xs focus:border-navy focus:outline-none text-navy bg-secondary/10 font-medium"
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !replyBody.trim()}
                    className="bg-navy text-gold px-5 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60 shrink-0"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} SEND
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs py-20 bg-secondary/5">
              <MessageSquare size={42} className="text-muted-foreground/30 mb-3" />
              <span>Select an active conversation or start a new thread</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Loader2, User, Phone, MapPin, Briefcase, Calendar, Info, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  role: string;
}

export default function CompleteProfileModal({ role }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    // Show modal if the user hasn't completed their profile
    if (role.toLowerCase() === "admin") return;
    
    if (user && user.user_metadata?.profile_completed !== true) {
      setOpen(true);
    }
  }, [user, role]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return; // Prevent double submission
    setLoading(true);

    try {
      // 1. Mark as completed in user metadata and save extra fields
      const { error: authError } = await supabase.auth.updateUser({
        data: { profile_completed: true, ...form }
      });

      if (authError) throw authError;

      // 2. Based on role, attempt to update only columns that exist in the database schema
      if (role.toLowerCase() === "parent" && form.phone) {
        const { error } = await supabase.from("parents").update({
          phone: form.phone
        }).eq("profile_id", user?.id);
        if (error) console.error("Parent update error:", error);
      } else if (role.toLowerCase() === "student" && form.gender) {
        const { error } = await supabase.from("students").update({
          gender: form.gender
        }).eq("profile_id", user?.id);
        if (error) console.error("Student update error:", error);
      }

      toast.success("Profile completed successfully!");
      setOpen(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const getFields = () => {
    switch (role.toLowerCase()) {
      case "teacher":
        return [
          { key: "phone", label: "Phone Number", icon: <Phone size={14} />, type: "tel" },
          { key: "address", label: "Home Address", icon: <MapPin size={14} />, type: "text" },
          { key: "next_of_kin", label: "Next of Kin Name", icon: <User size={14} />, type: "text" },
          { key: "next_of_kin_phone", label: "Next of Kin Phone", icon: <Phone size={14} />, type: "tel" },
        ];
      case "parent":
        return [
          { key: "phone", label: "Phone Number", icon: <Phone size={14} />, type: "tel" },
          { key: "address", label: "Home Address", icon: <MapPin size={14} />, type: "text" },
          { key: "occupation", label: "Occupation", icon: <Briefcase size={14} />, type: "text" },
        ];
      case "student":
        return [
          { key: "dob", label: "Date of Birth", icon: <Calendar size={14} />, type: "date" },
          { key: "gender", label: "Gender", icon: <User size={14} />, type: "text", placeholder: "Male or Female" },
          { key: "address", label: "Home Address", icon: <MapPin size={14} />, type: "text" },
        ];
      default:
        return [];
    }
  };

  const fields = getFields();

  return (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div className="h-2 w-full bg-gold absolute top-0 left-0" />
        
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Info size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-navy uppercase">Complete Your Profile</h2>
              <p className="text-muted-foreground text-sm">Please provide a few missing details to continue.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-navy/60 mb-2">
                  {f.icon} {f.label}
                </label>
                <input
                  required
                  type={f.type}
                  placeholder={f.placeholder || f.label}
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy transition"
                />
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-gold py-4 font-bold text-xs tracking-widest hover:bg-navy/90 transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "SAVE & CONTINUE"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

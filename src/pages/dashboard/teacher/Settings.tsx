import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, Shield, Bell, Camera } from "lucide-react";

export default function TeacherSettings() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loading & Saving States
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile fields (Loaded live)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [subjectSpecialization, setSubjectSpecialization] = useState("");
  const [qualification, setQualification] = useState("");

  // Communication Preferences state
  const [preferences, setPreferences] = useState({
    email_messages: true,
    email_reports: true,
    sms_alerts: true,
  });

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load teacher profile data
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      setEmail(user.email ?? "");

      // 1. Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, communication_preferences")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
        if (profile.communication_preferences) {
          setPreferences({
            email_messages: !!profile.communication_preferences.email_messages,
            email_reports: !!profile.communication_preferences.email_reports,
            sms_alerts: !!profile.communication_preferences.sms_alerts,
          });
        }
      }

      // 2. Get teacher specific info
      const { data: teacher } = await supabase
        .from("teachers")
        .select("subject_specialization, qualification")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (teacher) {
        setSubjectSpecialization(teacher.subject_specialization ?? "General");
        setQualification(teacher.qualification ?? "Degree");
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  // Handle Avatar Image Selection & Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type & size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    setUploadingAvatar(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    try {
      // 1. Upload to Supabase Storage avatars bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      let publicUrl = "";

      if (uploadError) {
        // Fallback for local development or unconfigured buckets
        publicUrl = URL.createObjectURL(file);
        toast.info("Bucket not fully provisioned. Using local mockup picture.");
      } else {
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      // 2. Update avatar_url in public.profiles
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) {
        toast.error(`Database failed to record avatar: ${dbError.message}`);
      } else {
        setAvatarUrl(publicUrl);
        toast.success("Profile image updated successfully!");
      }

    } catch (err: any) {
      toast.error(`Error uploading avatar: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save General Profile changes & Communication Preferences
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: fullName.trim(),
        communication_preferences: preferences
      })
      .eq("id", user.id);

    if (error) {
      toast.error(`Failed to update profile: ${error.message}`);
    } else {
      toast.success("Profile and preferences saved successfully!");
    }
    setSavingProfile(false);
  };

  // Change Password safely using Supabase Auth
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(`Password update failed: ${error.message}`);
    } else {
      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, picture, credentials, and notification settings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar Info & Avatar */}
        <div className="space-y-4">
          <div className="bg-white border border-border p-6 text-center relative group">
            
            {/* Avatar Display with upload overlay */}
            <div 
              onClick={handleAvatarClick} 
              className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border border-border relative cursor-pointer group shadow-sm bg-secondary"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-navy font-bold text-2xl">
                  {fullName ? fullName[0].toUpperCase() : "T"}
                </div>
              )}
              
              {/* Camera Upload Overlay */}
              <div className="absolute inset-0 bg-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {uploadingAvatar ? (
                  <Loader2 className="text-white animate-spin" size={20} />
                ) : (
                  <Camera className="text-white" size={20} />
                )}
              </div>
            </div>
            
            {/* Hidden File Picker */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              className="hidden" 
            />

            <h3 className="font-bold text-navy text-base leading-snug">{fullName || "Teacher Profile"}</h3>
            <p className="text-xs text-muted-foreground mt-1">{subjectSpecialization}</p>
            <p className="text-[10px] bg-secondary text-navy font-bold inline-block px-2 py-0.5 mt-2 rounded">
              {qualification}
            </p>
          </div>

          <div className="bg-white border border-border p-4 space-y-2">
            <h4 className="text-[10px] font-black text-navy tracking-wider uppercase mb-3">ADMIN ASSIGNED ROLES</h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-bold text-navy">{subjectSpecialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credential:</span>
                <span className="font-bold text-navy">{qualification}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Profile Form */}
          <div className="bg-white border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
              <User size={18} className="text-navy" />
              <h3 className="font-bold text-navy">Personal Details</h3>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-border px-3 py-2.5 text-sm focus:border-navy focus:outline-none text-navy bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full border border-border px-3 py-2.5 text-sm text-muted-foreground bg-secondary/40 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Communication Preferences Section Inside Profile Form */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={16} className="text-navy" />
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Communication Preferences</h4>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={preferences.email_messages} 
                      onChange={() => handlePreferenceChange("email_messages")}
                      className="accent-navy w-4 h-4" 
                    />
                    <span className="text-sm text-navy">Email me when parents or students send a message</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={preferences.email_reports} 
                      onChange={() => handlePreferenceChange("email_reports")}
                      className="accent-navy w-4 h-4" 
                    />
                    <span className="text-sm text-navy">Email me weekly class performance summary</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={preferences.sms_alerts} 
                      onChange={() => handlePreferenceChange("sms_alerts")}
                      className="accent-navy w-4 h-4" 
                    />
                    <span className="text-sm text-navy">SMS alerts for urgent school notices</span>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-navy text-gold px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60 mt-2"
              >
                {savingProfile && <Loader2 size={14} className="animate-spin" />}
                SAVE CHANGES
              </button>
            </form>
          </div>

          {/* Security Credentials Form */}
          <div className="bg-white border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
              <Shield size={18} className="text-navy" />
              <h3 className="font-bold text-navy">Change Password</h3>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">NEW PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    placeholder="••••••••"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-border px-3 py-2.5 text-sm focus:border-navy focus:outline-none text-navy bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    placeholder="••••••••"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-border px-3 py-2.5 text-sm focus:border-navy focus:outline-none text-navy bg-white"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={savingPassword}
                className="bg-navy text-gold px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60"
              >
                {savingPassword && <Loader2 size={14} className="animate-spin" />}
                UPDATE PASSWORD
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

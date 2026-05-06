import { toast } from "sonner";

export default function StudentSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account security and notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-border p-6">
          <h3 className="font-bold text-navy pb-3 border-b border-border mb-5">Change Password</h3>
          <div className="grid sm:grid-cols-3 gap-5">
            {["Current Password", "New Password", "Confirm Password"].map((label) => (
              <div key={label}>
                <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">{label.toUpperCase()}</label>
                <input type="password" placeholder="••••••••" className="w-full border border-border px-3 py-2.5 text-sm focus:border-navy focus:outline-none text-navy" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border p-6">
          <h3 className="font-bold text-navy pb-3 border-b border-border mb-5">Notifications</h3>
          <div className="space-y-4">
            {[
              "Email me when a teacher sends a message",
              "Email me reminders for upcoming assignments",
              "Email me when exam results are released",
              "Push notification for school announcements",
            ].map((label) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-navy w-4 h-4" />
                <span className="text-sm text-navy">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-navy text-gold px-8 py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition">
          SAVE CHANGES
        </button>
      </form>
    </div>
  );
}

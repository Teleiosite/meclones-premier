import { toast } from "sonner";

export default function ParentSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and communication preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-border p-6">
          <h3 className="font-bold text-navy pb-3 border-b border-border mb-5">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { label: "Full Name", value: "Mrs. Adeyemi", type: "text" },
              { label: "Email Address", value: "adeyemi@email.com", type: "email" },
              { label: "Phone Number", value: "+234 803 000 0001", type: "tel" },
              { label: "Alternate Phone", value: "", type: "tel" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">{f.label.toUpperCase()}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:border-navy focus:outline-none text-navy bg-white"
                />
              </div>
            ))}
          </div>
        </div>

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
              "Email me when my child's results are published",
              "SMS alert when fee payment is due",
              "Email reminders for PTA meetings and events",
              "Notify me of any attendance issues",
            ].map((label) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-navy w-4 h-4" />
                <span className="text-sm text-navy">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-navy text-gold px-8 py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition">
            SAVE CHANGES
          </button>
          <button type="button" className="border border-navy text-navy px-6 py-3 font-bold text-xs tracking-wider hover:bg-secondary transition">
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

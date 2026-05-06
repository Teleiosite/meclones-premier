import { toast } from "sonner";

const sharedSettings = [
  {
    section: "Account",
    fields: [
      { label: "Full Name", value: "Mr. Daniel Marko", type: "text" },
      { label: "Email Address", value: "d.marko@meclones.edu.ng", type: "email" },
      { label: "Phone Number", value: "+234 803 456 7890", type: "tel" },
    ],
  },
  {
    section: "Security",
    fields: [
      { label: "Current Password", value: "", type: "password" },
      { label: "New Password", value: "", type: "password" },
      { label: "Confirm New Password", value: "", type: "password" },
    ],
  },
];

export default function TeacherSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {sharedSettings.map((section) => (
          <div key={section.section} className="bg-white border border-border p-6">
            <h3 className="font-bold text-navy mb-5 pb-3 border-b border-border">{section.section}</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {section.fields.map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">{f.label.toUpperCase()}</label>
                  <input
                    type={f.type}
                    defaultValue={f.value}
                    placeholder={f.type === "password" ? "••••••••" : undefined}
                    className="w-full border border-border px-3 py-2.5 text-sm focus:border-navy focus:outline-none text-navy bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white border border-border p-6">
          <h3 className="font-bold text-navy mb-5 pb-3 border-b border-border">Notifications</h3>
          <div className="space-y-4">
            {[
              "Email me when a parent sends a message",
              "Email me when attendance is not marked by 9 AM",
              "Email me weekly class performance summary",
              "SMS alerts for urgent school notices",
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

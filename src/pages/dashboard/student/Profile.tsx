import { toast } from "sonner";

export default function StudentProfile() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Profile</h1>
        <p className="text-muted-foreground text-sm">Your personal information and academic profile.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white border border-border p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-navy text-gold flex items-center justify-center font-display text-4xl font-black mb-4">
            DO
          </div>
          <div className="font-bold text-navy text-xl">David Okafor</div>
          <div className="text-muted-foreground text-sm mt-1">SS 2 · Science Track</div>
          <div className="text-[11px] text-gold font-bold tracking-wider mt-2 bg-gold/10 px-3 py-1">MC-001</div>
          <div className="mt-5 w-full space-y-2 text-sm text-left">
            {[
              { label: "Class", value: "SS 2A" },
              { label: "Section", value: "Secondary" },
              { label: "Term", value: "Term 2, 2026" },
              { label: "House", value: "Blue House" },
              { label: "Admission Year", value: "2020" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b border-border pb-2 last:border-0">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-semibold text-navy">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSave} className="bg-white border border-border p-6 space-y-5">
            <h3 className="font-bold text-navy pb-3 border-b border-border">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: "First Name", value: "David", type: "text" },
                { label: "Last Name", value: "Okafor", type: "text" },
                { label: "Date of Birth", value: "2008-03-15", type: "date" },
                { label: "Gender", value: "Male", type: "text" },
                { label: "Phone (Optional)", value: "", type: "tel" },
                { label: "Email (Optional)", value: "", type: "email" },
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
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-navy text-gold px-8 py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition">
                SAVE CHANGES
              </button>
            </div>
          </form>

          <div className="bg-white border border-border p-6">
            <h3 className="font-bold text-navy pb-3 border-b border-border mb-5">Parent / Guardian</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Guardian Name", value: "Mrs. Adeyemi" },
                { label: "Relationship", value: "Mother" },
                { label: "Phone", value: "+234 803 000 0001" },
                { label: "Email", value: "adeyemi@email.com" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground font-bold tracking-wider mb-1">{r.label.toUpperCase()}</div>
                  <div className="font-semibold text-navy">{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

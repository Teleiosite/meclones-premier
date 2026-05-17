import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, UserPlus, ShieldCheck, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";


export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    password: "",
    role: (searchParams.get("role") as "parent" | "student" | "teacher") || "parent",
    subject_specialization: searchParams.get("subject") || "",
    qualification: searchParams.get("qualification") || "",
    employee_id: searchParams.get("emp_id") || "",
    phone: searchParams.get("phone") || "",
    address: searchParams.get("address") || "",
    occupation: searchParams.get("occupation") || "",
    admission_no: searchParams.get("admission_no") || "",
    student_class: searchParams.get("student_class") || "",
    gender: searchParams.get("gender") || "",
  });

  useEffect(() => {
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const name = searchParams.get("name");
    const subject = searchParams.get("subject");
    const qualification = searchParams.get("qualification");
    const emp_id = searchParams.get("emp_id");
    const phone = searchParams.get("phone");
    const address = searchParams.get("address");
    const occupation = searchParams.get("occupation");
    const admission_no = searchParams.get("admission_no");
    const student_class = searchParams.get("student_class");
    const gender = searchParams.get("gender");
    
    if (email || role || name || subject || qualification || emp_id || phone || address || occupation || admission_no || student_class || gender) {
      setFormData(prev => ({
        ...prev,
        email: email || prev.email,
        role: (role as any) || prev.role,
        fullName: name || prev.fullName,
        subject_specialization: subject || prev.subject_specialization,
        qualification: qualification || prev.qualification,
        employee_id: emp_id || prev.employee_id,
        phone: phone || prev.phone,
        address: address || prev.address,
        occupation: occupation || prev.occupation,
        admission_no: admission_no || prev.admission_no,
        student_class: student_class || prev.student_class,
        gender: gender || prev.gender,
      }));
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin + "/login",
          data: {
            full_name: formData.fullName,
            role: formData.role,
            subject_specialization: formData.subject_specialization || undefined,
            qualification: formData.qualification || undefined,
            employee_id: formData.employee_id || undefined,
            phone: formData.phone || undefined,
            address: formData.address || undefined,
            occupation: formData.occupation || undefined,
            admission_no: formData.admission_no || undefined,
            class: formData.student_class || undefined,
            gender: formData.gender || undefined,
          },
        },
      });

      if (authError) throw authError;
      
      setSent(true);
      toast.success("Verification email sent!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-navy/10 p-10 text-center shadow-xl">
          <div className="w-20 h-20 bg-gold/20 flex items-center justify-center mx-auto mb-6">
            <Mail size={40} className="text-navy" />
          </div>
          <h1 className="font-display text-3xl font-black text-navy mb-4 uppercase">Check your email</h1>
          <p className="text-navy/60 mb-8 leading-relaxed">
            We've sent a verification link to <strong className="text-navy">{formData.email}</strong>.<br/>
            Please click the link in the email to activate your account.
          </p>
          <Link to="/login" className="block w-full bg-navy text-gold py-4 font-bold text-xs tracking-widest hover:bg-navy/90 transition">
            RETURN TO LOGIN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <Link to="/" className="mb-8 group flex items-center gap-2">
        <img src={logoImg} alt="Meclones Group of Schools" className="w-10 h-10 object-contain" />
        <span className="font-display font-black text-2xl text-navy tracking-tighter">MECLONES GROUP OF SCHOOLS</span>
      </Link>

      <div className="w-full max-w-md bg-white border border-navy/10 p-8 md:p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="text-gold" size={24} />
          <h1 className="font-display text-3xl font-black text-navy">Join the Portal</h1>
        </div>
        
        {searchParams.get("email") && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 mb-6 text-emerald-800 text-sm flex gap-3">
            <ShieldCheck size={18} className="shrink-0" />
            <p>You've been invited! Your email and role have been pre-filled.</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-navy/40 mb-2 uppercase">Full Name</label>
            <input 
              required 
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full border border-border px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-navy/40 mb-2 uppercase">Email Address</label>
            <input 
              required 
              type="email"
              value={formData.email}
              readOnly={!!searchParams.get("email")}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full border border-border px-4 py-3 text-navy focus:outline-none focus:border-navy ${searchParams.get("email") ? 'bg-secondary/30' : 'bg-white'}`} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-navy/40 mb-2 uppercase">Create Password</label>
            <input 
              required 
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-border px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-navy/40 mb-2 uppercase">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["parent", "student", "teacher"].map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={!!searchParams.get("role")}
                  onClick={() => setFormData({ ...formData, role: r as any })}
                  className={`py-3 text-[10px] font-black tracking-tighter border transition-all uppercase ${
                    formData.role === r 
                      ? "bg-navy text-gold border-navy" 
                      : "border-border text-navy/40 hover:border-navy disabled:opacity-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-navy text-gold py-4 font-bold text-xs tracking-widest hover:bg-navy/90 transition flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "COMPLETE REGISTRATION →"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-navy font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

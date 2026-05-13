import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "teacher" | "student" | "parent";

const roleRoutePrefix: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
};

function normalizeRole(role?: string | null): UserRole | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  if (normalized === "admin" || normalized === "teacher" || normalized === "student" || normalized === "parent") {
    return normalized;
  }
  return null;
}

export default function AuthGuard() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function syncSessionAndRole() {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session);

      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(normalizeRole(profile?.role));
      } else {
        setUserRole(null);
      }

      setChecking(false);
    }

    syncSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthenticated(!!session);
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setUserRole(normalizeRole(profile?.role));
      } else {
        setUserRole(null);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-10 h-10 bg-navy flex items-center justify-center text-gold font-black text-lg mx-auto mb-3">M</div>
          <p className="text-sm text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname.startsWith("/dashboard")) {
    if (!userRole) {
      return <Navigate to="/login" replace state={{ reason: "role_not_configured" }} />;
    }

    const allowedPrefix = roleRoutePrefix[userRole];
    if (!location.pathname.startsWith(allowedPrefix)) {
      return <Navigate to={allowedPrefix} replace />;
    }
  }

  return <Outlet />;
}

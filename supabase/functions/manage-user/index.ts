// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // 1. Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Auth Check (Only admins can call this)
    // We check the JWT from the caller to ensure they are an admin
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Verify role is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Admins only" }), { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 3. Parse Request Body
    const { action, email, password, role, metadata, admission_id } = await req.json();

    if (action === "approve_admission") {
      if (!admission_id) throw new Error("Missing admission_id");

      // 1. Fetch admission details
      const { data: admission, error: fetchError } = await supabase
        .from("admissions")
        .select("*")
        .eq("id", admission_id)
        .single();
      
      if (fetchError || !admission) throw new Error("Admission record not found");
      if (admission.status === "Approved") throw new Error("Admission already approved");

      // 2. Create Parent Account
      const parentPassword = Math.random().toString(36).slice(-10);
      const { data: parentAuth, error: pAuthError } = await supabase.auth.admin.createUser({
        email: admission.parent_email,
        password: parentPassword,
        email_confirm: true,
        user_metadata: { role: "parent", full_name: admission.parent_name }
      });
      if (pAuthError) throw pAuthError;

      const parentUser = parentAuth.user;
      await supabase.from("profiles").upsert({ id: parentUser.id, role: "parent", email: admission.parent_email });
      
      const { data: parentRecord, error: pError } = await supabase.from("parents").insert({
        profile_id: parentUser.id,
        name: admission.parent_name,
        phone: admission.parent_phone,
        email: admission.parent_email
      }).select().single();
      if (pError) throw pError;

      // 3. Create Student Account
      // Generate an email for the student based on name/id if not provided
      const studentEmail = `${admission.applicant_name.toLowerCase().replace(/\s+/g, ".")}@meclones.edu.ng`;
      const studentPassword = Math.random().toString(36).slice(-10);
      
      const { data: studentAuth, error: sAuthError } = await supabase.auth.admin.createUser({
        email: studentEmail,
        password: studentPassword,
        email_confirm: true,
        user_metadata: { role: "student", full_name: admission.applicant_name }
      });
      if (sAuthError) throw sAuthError;

      const studentUser = studentAuth.user;
      await supabase.from("profiles").upsert({ id: studentUser.id, role: "student", email: studentEmail });

      const { error: sError } = await supabase.from("students").insert({
        profile_id: studentUser.id,
        parent_id: parentRecord.id,
        admission_no: `MC-${Date.now().toString().slice(-4)}`,
        name: admission.applicant_name,
        class: admission.class_applying,
        status: "Active"
      });
      if (sError) throw sError;

      // 4. Update Admission Status
      await supabase.from("admissions").update({ status: "Approved" }).eq("id", admission_id);

      return new Response(JSON.stringify({ 
        message: "Admission approved and accounts provisioned",
        parent_email: admission.parent_email,
        student_email: studentEmail,
        // In production, you'd send these via email, not return them in the response
        temp_passwords: { parent: parentPassword, student: studentPassword }
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    if (action === "create") {
      if (!email || !password || !role) {
        throw new Error("Missing required fields: email, password, role");
      }

      // 4. Create Auth User
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, full_name: metadata.full_name }
      });

      if (createError) throw createError;
      const newUser = authData.user;

      // 5. Create Profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: newUser.id,
        role: role,
        email: email
      });
      if (profileError) throw profileError;

      // 6. Create Role-Specific Record
      if (role === "teacher") {
        const { error: teacherError } = await supabase.from("teachers").insert({
          profile_id: newUser.id,
          employee_id: metadata.employee_id || `T-${Date.now()}`,
          name: metadata.full_name,
          subject_specialization: metadata.subject_specialization,
          qualification: metadata.qualification,
          status: "Active"
        });
        if (teacherError) throw teacherError;
      } 
      else if (role === "student") {
        const { error: studentError } = await supabase.from("students").insert({
          profile_id: newUser.id,
          admission_no: metadata.admission_no || `S-${Date.now()}`,
          name: metadata.full_name,
          class: metadata.class,
          gender: metadata.gender,
          parent_id: metadata.parent_id,
          status: "Active"
        });
        if (studentError) throw studentError;
      }
      else if (role === "parent") {
        const { error: parentError } = await supabase.from("parents").insert({
          profile_id: newUser.id,
          name: metadata.full_name,
          phone: metadata.phone,
          email: email,
          status: "Active"
        });
        if (parentError) throw parentError;
      }

      return new Response(JSON.stringify({ message: "User created successfully", user: newUser }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }


    return new Response(JSON.stringify({ error: "Invalid action" }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Manage User Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});

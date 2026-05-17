import { supabase } from '../lib/supabase';

export interface TeacherClockinRecord {
  id: string;
  teacher_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
}

export interface AttendancePolicy {
  key: string;
  label: string;
  value: string;
}

export const teacherAttendanceService = {
  /** Get the teacher row for the logged-in user */
  async getMyTeacherId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated.");

    const { data, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (error || !data) throw new Error("Teacher profile not found. Contact your administrator.");
    return data.id;
  },

  /** Get today's clockin record for the logged-in teacher */
  async getTodayRecord(teacherId: string): Promise<TeacherClockinRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('teacher_clockin')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('date', today)
      .maybeSingle();

    if (error) throw new Error(`Failed to load today's record: ${error.message}`);
    return data;
  },

  /** Get last 30 days of clockin history for the logged-in teacher */
  async getHistory(teacherId: string): Promise<TeacherClockinRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    const past30 = new Date();
    past30.setDate(past30.getDate() - 30);
    const startDate = past30.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('teacher_clockin')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('date', startDate)
      .lt('date', today)   // exclude today from history
      .order('date', { ascending: false })
      .limit(10);

    if (error) throw new Error(`Failed to load history: ${error.message}`);
    return data || [];
  },

  /** Clock in: insert a record for today */
  async clockIn(teacherId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('teacher_clockin')
      .insert({
        teacher_id: teacherId,
        date: today,
        clock_in: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23505') throw new Error("You have already clocked in today.");
      throw new Error(`Clock-in failed: ${error.message}`);
    }
  },

  /** Clock out: update today's record with clock_out time */
  async clockOut(teacherId: string, recordId: string, clockInTime: string): Promise<void> {
    const clockOut = new Date();
    if (new Date(clockOut) <= new Date(clockInTime)) {
      throw new Error("Clock-out time must be after clock-in time.");
    }

    const { error } = await supabase
      .from('teacher_clockin')
      .update({ clock_out: clockOut.toISOString() })
      .eq('id', recordId);

    if (error) throw new Error(`Clock-out failed: ${error.message}`);
  },
};

export const adminAttendanceService = {
  /** Get all teachers with their clockin status for a given date */
  async getTeacherAttendanceByDate(date: string): Promise<any[]> {
    const { data: teachers, error: tErr } = await supabase
      .from('teachers')
      .select('id, subject_specialization, status, profiles(full_name)')
      .eq('status', 'Active');

    if (tErr) throw new Error(`Failed to load teachers: ${tErr.message}`);

    const { data: clockins, error: cErr } = await supabase
      .from('teacher_clockin')
      .select('*')
      .eq('date', date);

    if (cErr) throw new Error(`Failed to load clock-in records: ${cErr.message}`);

    return (teachers || []).map((t: any) => {
      const record = (clockins || []).find((c: any) => c.teacher_id === t.id) || null;
      const profileName = Array.isArray(t.profiles) ? t.profiles[0]?.full_name : (t.profiles as any)?.full_name;
      return {
        teacher_id: t.id,
        name: profileName || 'Unknown Teacher',
        subject: t.subject_specialization,
        status: t.status,
        record_id: record?.id || null,
        clock_in: record?.clock_in || null,
        clock_out: record?.clock_out || null,
        present: !!record?.clock_in,
      };
    });
  },

  /** Admin: manually override a teacher's clock-in status */
  async toggleTeacherPresent(teacherId: string, date: string, existingRecordId: string | null, currentlyPresent: boolean): Promise<void> {
    if (currentlyPresent) {
      // Mark absent: delete the record (or set clock_in to null)
      if (existingRecordId) {
        const { error } = await supabase
          .from('teacher_clockin')
          .delete()
          .eq('id', existingRecordId);
        if (error) throw new Error(`Failed to mark absent: ${error.message}`);
      }
    } else {
      // Mark present: upsert with clock_in = start of day
      const { error } = await supabase
        .from('teacher_clockin')
        .upsert({
          id: existingRecordId || undefined,
          teacher_id: teacherId,
          date,
          clock_in: `${date}T08:00:00.000Z`,
        }, { onConflict: 'teacher_id,date' });
      if (error) throw new Error(`Failed to mark present: ${error.message}`);
    }
  },

  /** Load all attendance policies */
  async getPolicies(): Promise<AttendancePolicy[]> {
    const { data, error } = await supabase
      .from('attendance_policies')
      .select('key, label, value')
      .order('id');

    if (error) throw new Error(`Failed to load policies: ${error.message}`);
    return data || [];
  },

  /** Save a single policy value */
  async updatePolicy(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('attendance_policies')
      .update({ value })
      .eq('key', key);

    if (error) throw new Error(`Failed to save policy: ${error.message}`);
  },
};

import { supabaseClient } from '../lib/supabaseClient';
import type { Employee } from './employeeService';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  check_in: string | null;
  check_out: string | null;
  notes: string | null;
  employees?: Pick<Employee, 'full_name' | 'department'>;
}

export const attendanceService = {
  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabaseClient
      .from('unified_attendance')
      .select(`
        id, employee_id, date, status, check_in, check_out, notes,
        employees ( full_name, department )
      `)
      .eq('date', date);

    if (error) throw new Error(`Failed to load attendance: ${error.message}`);
    return (data as any) || [];
  },

  async getAttendanceRange(startDate: string, endDate: string, employeeId?: string): Promise<AttendanceRecord[]> {
    let query = supabaseClient
      .from('unified_attendance')
      .select(`
        id, employee_id, date, status, check_in, check_out, notes,
        employees ( full_name, department )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load attendance range: ${error.message}`);
    return (data as any) || [];
  },

  async upsertAttendance(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    // Validate checkout vs checkin if both exist
    if (record.check_in && record.check_out) {
      if (new Date(record.check_out) <= new Date(record.check_in)) {
        throw new Error("Check-out time must be later than check-in time.");
      }
    }

    const { data, error } = await supabaseClient
      .from('unified_attendance')
      .upsert({
        id: record.id,
        employee_id: record.employee_id,
        date: record.date,
        status: record.status,
        check_in: record.check_in,
        check_out: record.check_out,
        notes: record.notes
      }, { onConflict: 'employee_id,date' })
      .select()
      .single();

    if (error) throw new Error(`Failed to save attendance: ${error.message}`);
    return data as any;
  },

  async bulkUpsertAttendance(records: Partial<AttendanceRecord>[]): Promise<AttendanceRecord[]> {
    const { data, error } = await supabaseClient
      .from('unified_attendance')
      .upsert(records.map(r => ({
        id: r.id,
        employee_id: r.employee_id,
        date: r.date,
        status: r.status,
        check_in: r.check_in,
        check_out: r.check_out,
        notes: r.notes
      })), { onConflict: 'employee_id,date' })
      .select();

    if (error) throw new Error(`Failed to bulk save attendance: ${error.message}`);
    return data as any;
  },

  async deleteAttendance(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('unified_attendance')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete attendance: ${error.message}`);
  },

  async getAttendanceSummary(startDate: string, endDate: string): Promise<any> {
    const { data, error } = await supabaseClient
      .from('unified_attendance')
      .select('status')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw new Error(`Failed to get summary: ${error.message}`);

    const summary = { present: 0, absent: 0, late: 0, half_day: 0, leave: 0 };
    data?.forEach(r => {
      if (summary[r.status as keyof typeof summary] !== undefined) {
        summary[r.status as keyof typeof summary]++;
      }
    });
    return summary;
  }
};

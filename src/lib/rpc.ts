/**
 * src/lib/rpc.ts
 * 
 * Typed wrappers for all Supabase RPC calls and audit log writes.
 * Import from here instead of calling supabase.rpc() inline.
 */

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FeeStats = {
  total_collected: number;
  outstanding: number;
  this_month: number;
  collection_rate: number;
  fee_count: number;
};

export type AttendanceBatchRecord = {
  student_id: string;
  status: "Present" | "Absent" | "Late";
};

export type AttendanceBatchResult = {
  saved_count: number;
  present_count: number;
  absent_count: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Fee Stats RPC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls the `get_fee_stats` Postgres function.
 * Returns authoritative financial KPIs — never calculated in the browser.
 */
export async function getFeeStats(): Promise<{ data: FeeStats | null; error: string | null }> {
  const { data, error } = await supabase.rpc("get_fee_stats");

  if (error) {
    console.error("[rpc] get_fee_stats failed:", error.message);
    return { data: null, error: error.message };
  }

  // RPC returns an array with one row
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return { data: null, error: "No data returned from get_fee_stats" };
  }

  return {
    data: {
      total_collected: Number(row.total_collected ?? 0),
      outstanding:     Number(row.outstanding ?? 0),
      this_month:      Number(row.this_month ?? 0),
      collection_rate: Number(row.collection_rate ?? 0),
      fee_count:       Number(row.fee_count ?? 0),
    },
    error: null,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Server-authoritative Attendance Save
// ─────────────────────────────────────────────────────────────────────────────

export async function submitAttendanceBatch(params: {
  className: string;
  date: string;
  records: AttendanceBatchRecord[];
}): Promise<{ data: AttendanceBatchResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("submit_attendance_batch", {
    p_class_name: params.className,
    p_date: params.date,
    p_records: params.records,
  });

  if (error) {
    console.error("[rpc] submit_attendance_batch failed:", error.message);
    return { data: null, error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    data: row
      ? {
          saved_count: Number(row.saved_count ?? 0),
          present_count: Number(row.present_count ?? 0),
          absent_count: Number(row.absent_count ?? 0),
        }
      : null,
    error: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Teacher Clock-in / Clock-out RPCs
// ─────────────────────────────────────────────────────────────────────────────

export async function teacherClockIn(): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("teacher_clock_in");
  if (error) {
    console.error("[rpc] teacher_clock_in failed:", error.message);
    return { error: error.message };
  }
  return { error: null };
}

export async function teacherClockOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("teacher_clock_out");
  if (error) {
    console.error("[rpc] teacher_clock_out failed:", error.message);
    return { error: error.message };
  }
  return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Audit Log
// ─────────────────────────────────────────────────────────────────────────────


export async function logPaymentReminder(paymentId: string, note?: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("log_payment_reminder", {
    p_payment_id: paymentId,
    p_note: note ?? null,
  });

  if (error) {
    console.warn("[audit] Failed to log payment reminder:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Frontend Error Logging
// ─────────────────────────────────────────────────────────────────────────────

export type FrontendErrorEntry = {
  user_id?: string | null;
  route: string;
  message: string;
  stack_trace?: string;
  user_agent?: string;
};

/**
 * Silently logs a frontend crash or unhandled error to the database.
 */
export async function logFrontendError(entry: FrontendErrorEntry): Promise<void> {
  // Fire and forget, don't crash the error handler if logging fails
  supabase.from("frontend_errors").insert(entry).then(({ error }) => {
    if (error) {
      console.error("[error-logger] Failed to save frontend error:", error.message);
    }
  });
}

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

export type AttendanceAuditEntry = {
  student_id: string;
  teacher_id: string;
  date: string;           // ISO date string e.g. "2026-05-13"
  old_status: string | null;
  new_status: string;
  note?: string;
};

export type PaymentAuditEntry = {
  payment_id?: string;
  student_id?: string;
  old_status?: string;
  new_status: string;
  changed_by: string;     // auth.uid()
  action: "reminder" | "status_change" | "webhook";
  note?: string;
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
// Attendance Audit Log
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Writes a batch of attendance audit entries after a successful upsert.
 * Fire-and-forget is acceptable — a failure here should NOT block the save.
 */
export async function logAttendanceChanges(entries: AttendanceAuditEntry[]): Promise<void> {
  if (entries.length === 0) return;

  const { error } = await supabase.from("attendance_audit_log").insert(entries);

  if (error) {
    // Non-fatal — log to console only. The attendance data itself is already saved.
    console.warn("[audit] Failed to write attendance audit log:", error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Audit Log
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Writes a single payment audit entry.
 * Use for reminder actions, status changes, and webhook events.
 */
export async function logPaymentChange(entry: PaymentAuditEntry): Promise<void> {
  const { error } = await supabase.from("payment_audit_log").insert(entry);

  if (error) {
    console.warn("[audit] Failed to write payment audit log:", error.message);
  }
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

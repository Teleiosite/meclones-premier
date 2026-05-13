-- ============================================================
-- RPC: get_fee_stats()
-- Returns authoritative financial KPIs calculated in Postgres.
-- Call from the frontend via: supabase.rpc('get_fee_stats')
--
-- NOTE: SECURITY DEFINER removed — it was triggering strict
-- compile-time table validation in Supabase. Authenticated RLS
-- policies on payments/fees tables handle access instead.
-- ============================================================

CREATE OR REPLACE FUNCTION get_fee_stats()
RETURNS TABLE (
  total_collected  NUMERIC,
  outstanding      NUMERIC,
  this_month       NUMERIC,
  collection_rate  NUMERIC,
  fee_count        BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_collected NUMERIC := 0;
  v_total_fees      NUMERIC := 0;
  v_outstanding     NUMERIC := 0;
  v_this_month      NUMERIC := 0;
  v_fee_count       BIGINT  := 0;
  v_rate            NUMERIC := 0;
  v_month_start     TIMESTAMPTZ;
BEGIN
  -- Total successfully collected across all time
  BEGIN
    SELECT COALESCE(SUM(p.amount), 0)
      INTO v_total_collected
      FROM payments p
     WHERE p.status = 'success';
  EXCEPTION WHEN undefined_table THEN
    v_total_collected := 0;
  END;

  -- Total fees ever issued (the target amount)
  BEGIN
    SELECT COALESCE(SUM(f.amount), 0), COUNT(*)
      INTO v_total_fees, v_fee_count
      FROM fees f;
  EXCEPTION WHEN undefined_table THEN
    v_total_fees := 0;
    v_fee_count  := 0;
  END;

  -- Outstanding = target minus collected (never negative)
  v_outstanding := GREATEST(0, v_total_fees - v_total_collected);

  -- This calendar month (Lagos timezone)
  v_month_start := date_trunc('month', NOW() AT TIME ZONE 'Africa/Lagos');

  BEGIN
    SELECT COALESCE(SUM(p.amount), 0)
      INTO v_this_month
      FROM payments p
     WHERE p.status = 'success'
       AND p.paid_at >= v_month_start;
  EXCEPTION WHEN undefined_table THEN
    v_this_month := 0;
  END;

  -- Collection rate (0–100)
  IF (v_total_collected + v_outstanding) > 0 THEN
    v_rate := ROUND(
      (v_total_collected / (v_total_collected + v_outstanding)) * 100, 1
    );
  END IF;

  RETURN QUERY SELECT
    v_total_collected,
    v_outstanding,
    v_this_month,
    v_rate,
    v_fee_count;
END;
$$;

-- Allow anon and authenticated roles to call this function
GRANT EXECUTE ON FUNCTION get_fee_stats() TO anon, authenticated;

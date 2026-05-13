-- ============================================================
-- RPC: get_fee_stats()
-- Returns authoritative financial KPIs calculated in Postgres.
-- Call from the frontend via: supabase.rpc('get_fee_stats')
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
SECURITY DEFINER   -- runs as owner so RLS doesn't block the aggregate
SET search_path = public
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
  SELECT COALESCE(SUM(amount), 0)
    INTO v_total_collected
    FROM payments
   WHERE status = 'success';

  -- Total fees ever issued (the "target")
  SELECT COALESCE(SUM(amount), 0), COUNT(*)
    INTO v_total_fees, v_fee_count
    FROM fees;

  -- Outstanding = target minus collected (floor at 0)
  v_outstanding := GREATEST(0, v_total_fees - v_total_collected);

  -- This calendar month
  v_month_start := date_trunc('month', NOW() AT TIME ZONE 'Africa/Lagos');

  SELECT COALESCE(SUM(amount), 0)
    INTO v_this_month
    FROM payments
   WHERE status = 'success'
     AND paid_at >= v_month_start;

  -- Collection rate (0-100)
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

-- Grant anon/authenticated roles permission to call this function
GRANT EXECUTE ON FUNCTION get_fee_stats() TO anon, authenticated;

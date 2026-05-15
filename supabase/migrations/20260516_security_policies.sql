-- ============================================================
-- Attendance Security Policies: Network Isolation + Geofence
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add new policy rows for network + geo enforcement
INSERT INTO attendance_policies (key, value, label) VALUES
  ('ip_pool',            '',           'Authorized IP Pool'),
  ('ip_enforcement',     'disabled',   'IP Enforcement Protocol'),
  ('geo_latitude',       '',           'Latitude Reference'),
  ('geo_longitude',      '',           'Longitude Reference'),
  ('geo_radius',         '200',        'Authorized Radius (m)'),
  ('geo_enforcement',    'disabled',   'Accuracy Protocol')
ON CONFLICT (key) DO NOTHING;

-- Grant access so the policy table is readable/writable by frontend
GRANT SELECT, UPDATE ON attendance_policies TO authenticated;
GRANT SELECT ON attendance_policies TO anon;

-- Reload PostgREST schema cache (fixes "schema cache" errors)
NOTIFY pgrst, 'reload schema';

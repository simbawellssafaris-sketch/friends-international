-- The server (secret key, role service_role) saves public enquiries and needs the reference-number counters.
grant usage on schema private to service_role;
grant usage, select on all sequences in schema private to service_role;

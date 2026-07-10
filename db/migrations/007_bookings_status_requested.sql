-- 007: Allow 'requested' as a booking status.
-- Restaurant reservations are confirmation-only (requires_payment = false)
-- and insert with status = 'requested' (see features/restaurants/api.js /
-- sections/Reserve.jsx and CLAUDE.md's data model note). 001_init_schema.sql
-- predates the restaurants vertical and never anticipated this status, so
-- bookings_status_check rejects the insert with a 23514 check violation.
--
-- The constraint name is confirmed (not guessed) from the actual error:
-- "new row for relation \"bookings\" violates check constraint
-- \"bookings_status_check\"".

alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'requested'));

-- Store the (possibly user-edited) AI itinerary alongside the trip so members
-- and prospective members can see the full plan, not just the summary.
ALTER TABLE trips ADD COLUMN itinerary_json TEXT;

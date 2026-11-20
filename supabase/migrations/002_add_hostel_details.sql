-- 002_add_hostel_details.sql
-- Migration: Add Hostel Location (City, State, PIN, Maps Link), Floors, Washroom Facilities, Monthly Rent, AC

-- 1. Enhance Hostels Table
ALTER TABLE public.hostels 
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hyderabad',
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Telangana',
ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '500081',
ADD COLUMN IF NOT EXISTS maps_url TEXT;

-- 2. Enhance Rooms Table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS floor TEXT DEFAULT 'Ground Floor',
ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC DEFAULT 6000,
ADD COLUMN IF NOT EXISTS attached_washroom BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS common_washroom BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ac BOOLEAN DEFAULT FALSE;

-- Comments for documentation
COMMENT ON COLUMN public.hostels.city IS 'Hostel City name (e.g. Hyderabad)';
COMMENT ON COLUMN public.hostels.state IS 'Hostel State name (e.g. Telangana)';
COMMENT ON COLUMN public.hostels.pincode IS 'Postal PIN Code (e.g. 500038)';
COMMENT ON COLUMN public.hostels.maps_url IS 'Google Maps link or search query URL';

COMMENT ON COLUMN public.rooms.floor IS 'Floor name: Ground Floor, 1st Floor .. 10th Floor';
COMMENT ON COLUMN public.rooms.monthly_rent IS 'Monthly rent in INR (e.g. 6000)';
COMMENT ON COLUMN public.rooms.attached_washroom IS 'Whether room has attached washroom (Yes/No)';
COMMENT ON COLUMN public.rooms.common_washroom IS 'Whether hostel has common washroom access (Yes/No)';
COMMENT ON COLUMN public.rooms.ac IS 'Whether room has AC installed (AC / Non-AC)';

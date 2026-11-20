-- 001_initial_schema.sql
-- Narasimha PG Hostel Management Schema with Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hostels Table
CREATE TABLE IF NOT EXISTS public.hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    area TEXT,
    address TEXT,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    room_number TEXT NOT NULL,
    sharing_type INTEGER NOT NULL CHECK (sharing_type BETWEEN 1 AND 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hostel_id, room_number)
);

-- Beds Table
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    bed_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, bed_number)
);

-- Resident Assignments Table
CREATE TABLE IF NOT EXISTS public.resident_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_id UUID REFERENCES public.beds(id) ON DELETE CASCADE NOT NULL,
    resident_name TEXT NOT NULL,
    mobile_number TEXT,
    move_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    checkout_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resident_assignments ENABLE ROW LEVEL SECURITY;

-- Hostels Policy
CREATE POLICY "Owners can manage their hostels" ON public.hostels
    FOR ALL USING (auth.uid() = owner_id);

-- Rooms Policy
CREATE POLICY "Owners can manage rooms for their hostels" ON public.rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hostels
            WHERE public.hostels.id = public.rooms.hostel_id
            AND public.hostels.owner_id = auth.uid()
        )
    );

-- Beds Policy
CREATE POLICY "Owners can manage beds" ON public.beds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rooms
            JOIN public.hostels ON public.hostels.id = public.rooms.hostel_id
            WHERE public.rooms.id = public.beds.room_id
            AND public.hostels.owner_id = auth.uid()
        )
    );

-- Resident Assignments Policy
CREATE POLICY "Owners can manage resident assignments" ON public.resident_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.beds
            JOIN public.rooms ON public.rooms.id = public.beds.room_id
            JOIN public.hostels ON public.hostels.id = public.rooms.hostel_id
            WHERE public.beds.id = public.resident_assignments.bed_id
            AND public.hostels.owner_id = auth.uid()
        )
    );

-- Trigger to auto-generate beds when room is created
CREATE OR REPLACE FUNCTION public.handle_new_room_beds()
RETURNS TRIGGER AS $$
BEGIN
    FOR i IN 1..NEW.sharing_type LOOP
        INSERT INTO public.beds (room_id, bed_number)
        VALUES (NEW.id, i);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_room_created
    AFTER INSERT ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_room_beds();

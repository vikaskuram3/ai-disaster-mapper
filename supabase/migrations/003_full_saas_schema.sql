-- 003_full_saas_schema.sql
-- Comprehensive PG Hostel Management SaaS Schema
-- Multi-Tenant with Row-Level Security (RLS) for Hostel Owners and Students

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Owners & Students)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'student')),
    mobile_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Hostels Table
CREATE TABLE IF NOT EXISTS public.hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Boys' CHECK (type IN ('Boys', 'Girls', 'Co-living')),
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Hyderabad',
    state TEXT NOT NULL DEFAULT 'Telangana',
    pincode TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    maps_url TEXT,
    total_floors INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Floors Table
CREATE TABLE IF NOT EXISTS public.floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    floor_name TEXT NOT NULL,
    floor_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hostel_id, floor_name)
);

-- 4. Hostel Sharing Pricing Table (Owner configured rent per person by sharing type)
CREATE TABLE IF NOT EXISTS public.hostel_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    sharing_type INTEGER NOT NULL CHECK (sharing_type BETWEEN 1 AND 5),
    price_per_person NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hostel_id, sharing_type)
);

-- 5. Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    room_number TEXT NOT NULL,
    floor_name TEXT NOT NULL DEFAULT 'Ground Floor',
    sharing_type INTEGER NOT NULL CHECK (sharing_type BETWEEN 1 AND 5),
    monthly_rent NUMERIC(10,2) NOT NULL DEFAULT 6000.00,
    ac BOOLEAN DEFAULT FALSE,
    attached_washroom BOOLEAN DEFAULT TRUE,
    common_washroom BOOLEAN DEFAULT FALSE,
    room_status TEXT DEFAULT 'Available' CHECK (room_status IN ('Available', 'Full', 'Maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hostel_id, room_number)
);

-- 6. Beds Table
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    bed_number INTEGER NOT NULL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, bed_number)
);

-- 7. Students Table (with permanent agreed rent & payment due date tracking)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- optional link to student login account
    student_id_code TEXT UNIQUE NOT NULL, -- e.g. STU-2026-001
    full_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT,
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE RESTRICT NOT NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE RESTRICT NOT NULL,
    bed_id UUID REFERENCES public.beds(id) ON DELETE RESTRICT UNIQUE NOT NULL,
    sharing_type INTEGER NOT NULL CHECK (sharing_type BETWEEN 1 AND 5),
    agreed_monthly_rent NUMERIC(10,2) NOT NULL, -- Fixed agreed rent that does not change automatically
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    rent_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_payment_due_date DATE NOT NULL,
    emergency_contact TEXT,
    emergency_phone TEXT,
    student_status TEXT DEFAULT 'Active' CHECK (student_status IN ('Active', 'Vacated', 'Inactive')),
    vacated_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    monthly_rent NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    pending_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer')),
    transaction_ref TEXT,
    billing_cycle_month TEXT NOT NULL, -- e.g. 'November 2026'
    next_due_date DATE NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Partial', 'Overdue')),
    receipt_number TEXT UNIQUE NOT NULL, -- e.g. RCP-2026-001
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Rent Reminders & Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('one_day_before', 'due_date', 'overdue', 'manual', 'payment_receipt')),
    due_date DATE NOT NULL,
    recipient_mobile TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'WhatsApp' CHECK (channel IN ('WhatsApp', 'SMS')),
    message_body TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Sent', 'Failed', 'Simulated')),
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Messaging Provider Configuration Table (Securely held per owner)
CREATE TABLE IF NOT EXISTS public.messaging_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    provider TEXT NOT NULL DEFAULT 'whatsapp_business' CHECK (provider IN ('whatsapp_business', 'twilio', 'msg91', 'fast2sms')),
    test_mode BOOLEAN DEFAULT TRUE,
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    sender_phone_number_id TEXT,
    sms_sender_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hostels_owner ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hostel ON public.rooms(hostel_id);
CREATE INDEX IF NOT EXISTS idx_beds_room ON public.beds(room_id);
CREATE INDEX IF NOT EXISTS idx_students_hostel ON public.students(hostel_id);
CREATE INDEX IF NOT EXISTS idx_students_due_date ON public.students(next_payment_due_date);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_notification_student_due ON public.notification_logs(student_id, reminder_type, due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_config ENABLE ROW LEVEL SECURITY;

-- Owner Policies
CREATE POLICY "Owners can manage own hostels" ON public.hostels
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage own rooms" ON public.rooms
    FOR ALL USING (EXISTS (SELECT 1 FROM public.hostels WHERE hostels.id = rooms.hostel_id AND hostels.owner_id = auth.uid()));

CREATE POLICY "Owners can manage own students" ON public.students
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage own payments" ON public.payments
    FOR ALL USING (EXISTS (SELECT 1 FROM public.hostels WHERE hostels.id = payments.hostel_id AND hostels.owner_id = auth.uid()));

-- Student Policies
CREATE POLICY "Students can view assigned room" ON public.rooms
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.students WHERE students.room_id = rooms.id AND students.user_id = auth.uid()));

CREATE POLICY "Students can view own profile" ON public.students
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can view own payments" ON public.payments
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = payments.student_id AND students.user_id = auth.uid()));

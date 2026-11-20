/**
 * Narasimha PG Hostel Manager v3.0 - Enterprise SaaS Edition
 * Complete Commercial PG Hostel Management System with Multi-Tenant Architecture
 * Hyderabad, Telangana, India
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    DB: 'pghostel_mock_db_v3',
    CURRENT_USER: 'pghostel_mock_current_user_v3',
    BACKEND_MODE: 'pghostel_backend_mode_v3',
    MESSAGING_CONFIG: 'pghostel_messaging_config_v3'
  };

  // Standard Available Floors
  const STANDARD_FLOORS = [
    'Ground Floor',
    '1st Floor',
    '2nd Floor',
    '3rd Floor',
    '4th Floor',
    '5th Floor',
    '6th Floor',
    '7th Floor',
    '8th Floor',
    '9th Floor',
    '10th Floor'
  ];

  // Sharing Types & Default Prices (Module 3)
  const SHARING_CONFIG = {
    1: { name: 'Single Sharing', defaultRent: 10000, beds: 1 },
    2: { name: '2 Sharing', defaultRent: 7000, beds: 2 },
    3: { name: '3 Sharing', defaultRent: 6000, beds: 3 },
    4: { name: '4 Sharing', defaultRent: 5000, beds: 4 },
    5: { name: '5 Sharing', defaultRent: 4500, beds: 5 }
  };

  // Initial Seed Data
  function getSeedDatabase() {
    const owner1Id = '00000000-0000-4000-8000-000000000001';
    const owner2Id = '00000000-0000-4000-8000-000000000002';
    const student1Id = '00000000-0000-4000-8000-000000000011';
    const student2Id = '00000000-0000-4000-8000-000000000012';

    const hostel1Id = '11111111-1111-4000-8000-111111111111'; // Sai PG (Madhapur)
    const hostel2Id = '22222222-2222-4000-8000-222222222222'; // Lakshmi PG (Hitec City)
    const hostel3Id = '33333333-3333-4000-8000-333333333333'; // Sri Sai Boys Hostel (Ameerpet)

    const room101Id = '44444444-1111-4000-8000-000000000101';
    const room102Id = '44444444-2222-4000-8000-000000000102';
    const room205Id = '44444444-3333-4000-8000-000000000205';

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return {
      profiles: [
        {
          id: owner1Id,
          email: 'owner1@hostel.com',
          passwordHash: 'password123',
          full_name: 'Narasimha Rao',
          role: 'owner',
          mobile_number: '+91 98480 12345'
        },
        {
          id: owner2Id,
          email: 'owner2@hostel.com',
          passwordHash: 'password123',
          full_name: 'Vikas Kuram',
          role: 'owner',
          mobile_number: '+91 91234 56780'
        },
        {
          id: student1Id,
          email: 'ravi@gmail.com',
          passwordHash: 'student123',
          full_name: 'Ravi Kumar',
          role: 'student',
          mobile_number: '+91 98765 00001'
        },
        {
          id: student2Id,
          email: 'suresh@gmail.com',
          passwordHash: 'student123',
          full_name: 'Suresh Varma',
          role: 'student',
          mobile_number: '+91 98765 00002'
        }
      ],
      hostels: [
        {
          id: hostel1Id,
          owner_id: owner1Id,
          name: 'Sai PG',
          type: 'Boys',
          area: 'Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          address: 'Plot 42, Silicon Valley, Near Image Hospital, Madhapur, Hyderabad, Telangana',
          contact_number: '+91 98765 43210',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Plot+42+Silicon+Valley+Madhapur+Hyderabad+Telangana+500081',
          total_floors: 4,
          created_at: '2026-11-01T10:00:00.000Z'
        },
        {
          id: hostel2Id,
          owner_id: owner1Id,
          name: 'Lakshmi PG',
          type: 'Girls',
          area: 'Hitec City',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          address: 'Near Cyber Towers, Hitec City, Hyderabad, Telangana',
          contact_number: '+91 91234 56789',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Near+Cyber+Towers+Hitec+City+Hyderabad+Telangana+500081',
          total_floors: 3,
          created_at: '2026-11-02T10:00:00.000Z'
        },
        {
          id: hostel3Id,
          owner_id: owner1Id,
          name: 'Sri Sai Boys Hostel',
          type: 'Boys',
          area: 'Ameerpet',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500038',
          address: 'Beside Metro Pillar A1042, Ameerpet, Hyderabad, Telangana',
          contact_number: '+91 98480 12345',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Ameerpet+Metro+Pillar+A1042+Hyderabad+Telangana+500038',
          total_floors: 5,
          created_at: '2026-11-01T09:00:00.000Z'
        }
      ],
      floors: [
        { id: 'fl-1', hostel_id: hostel1Id, floor_name: 'Ground Floor', floor_order: 0 },
        { id: 'fl-2', hostel_id: hostel1Id, floor_name: '1st Floor', floor_order: 1 },
        { id: 'fl-3', hostel_id: hostel1Id, floor_name: '2nd Floor', floor_order: 2 },
        { id: 'fl-4', hostel_id: hostel1Id, floor_name: '3rd Floor', floor_order: 3 },
        { id: 'fl-5', hostel_id: hostel2Id, floor_name: 'Ground Floor', floor_order: 0 },
        { id: 'fl-6', hostel_id: hostel2Id, floor_name: '1st Floor', floor_order: 1 },
        { id: 'fl-7', hostel_id: hostel3Id, floor_name: 'Ground Floor', floor_order: 0 },
        { id: 'fl-8', hostel_id: hostel3Id, floor_name: '1st Floor', floor_order: 1 },
        { id: 'fl-9', hostel_id: hostel3Id, floor_name: '2nd Floor', floor_order: 2 }
      ],
      pricing: [
        { id: 'pr-1', hostel_id: hostel1Id, sharing_type: 1, price_per_person: 10000 },
        { id: 'pr-2', hostel_id: hostel1Id, sharing_type: 2, price_per_person: 7000 },
        { id: 'pr-3', hostel_id: hostel1Id, sharing_type: 3, price_per_person: 6000 },
        { id: 'pr-4', hostel_id: hostel1Id, sharing_type: 4, price_per_person: 5000 },
        { id: 'pr-5', hostel_id: hostel1Id, sharing_type: 5, price_per_person: 4500 },
        { id: 'pr-6', hostel_id: hostel2Id, sharing_type: 1, price_per_person: 11000 },
        { id: 'pr-7', hostel_id: hostel2Id, sharing_type: 2, price_per_person: 7500 },
        { id: 'pr-8', hostel_id: hostel2Id, sharing_type: 3, price_per_person: 6500 },
        { id: 'pr-9', hostel_id: hostel3Id, sharing_type: 1, price_per_person: 9500 },
        { id: 'pr-10', hostel_id: hostel3Id, sharing_type: 2, price_per_person: 6500 },
        { id: 'pr-11', hostel_id: hostel3Id, sharing_type: 3, price_per_person: 6000 }
      ],
      rooms: [
        {
          id: room101Id,
          hostel_id: hostel1Id,
          room_number: '101',
          floor_name: '2nd Floor',
          sharing_type: 3,
          monthly_rent: 6000,
          ac: false,
          attached_washroom: true,
          common_washroom: false,
          room_status: 'Available',
          created_at: '2026-11-03T10:00:00.000Z'
        },
        {
          id: room102Id,
          hostel_id: hostel2Id,
          room_number: '102',
          floor_name: '1st Floor',
          sharing_type: 2,
          monthly_rent: 7500,
          ac: true,
          attached_washroom: true,
          common_washroom: true,
          room_status: 'Available',
          created_at: '2026-11-03T11:00:00.000Z'
        },
        {
          id: room205Id,
          hostel_id: hostel3Id,
          room_number: '205',
          floor_name: '2nd Floor',
          sharing_type: 3,
          monthly_rent: 6000,
          ac: false,
          attached_washroom: true,
          common_washroom: false,
          room_status: 'Available',
          created_at: '2026-11-02T11:00:00.000Z'
        }
      ],
      beds: [
        { id: 'bed-101-1', room_id: room101Id, bed_number: 1, status: 'Occupied' },
        { id: 'bed-101-2', room_id: room101Id, bed_number: 2, status: 'Occupied' },
        { id: 'bed-101-3', room_id: room101Id, bed_number: 3, status: 'Available' },
        { id: 'bed-102-1', room_id: room102Id, bed_number: 1, status: 'Occupied' },
        { id: 'bed-102-2', room_id: room102Id, bed_number: 2, status: 'Available' },
        { id: 'bed-205-1', room_id: room205Id, bed_number: 1, status: 'Occupied' },
        { id: 'bed-205-2', room_id: room205Id, bed_number: 2, status: 'Occupied' },
        { id: 'bed-205-3', room_id: room205Id, bed_number: 3, status: 'Available' }
      ],
      students: [
        {
          id: 'stu-1',
          owner_id: owner1Id,
          user_id: student1Id,
          student_id_code: 'STU-2026-001',
          full_name: 'Ravi Kumar',
          mobile_number: '+91 98765 00001',
          email: 'ravi@gmail.com',
          hostel_id: hostel1Id,
          room_id: room101Id,
          bed_id: 'bed-101-1',
          sharing_type: 3,
          agreed_monthly_rent: 6000, // Fixed agreed rent
          joining_date: '2026-11-01',
          rent_start_date: '2026-11-01',
          next_payment_due_date: tomorrowStr, // Due tomorrow for automated reminder test
          emergency_contact: 'Ram Kumar (Father)',
          emergency_phone: '+91 98765 99991',
          student_status: 'Active',
          created_at: '2026-11-01T10:00:00.000Z'
        },
        {
          id: 'stu-2',
          owner_id: owner1Id,
          user_id: student2Id,
          student_id_code: 'STU-2026-002',
          full_name: 'Suresh Varma',
          mobile_number: '+91 98765 00002',
          email: 'suresh@gmail.com',
          hostel_id: hostel1Id,
          room_id: room101Id,
          bed_id: 'bed-101-2',
          sharing_type: 3,
          agreed_monthly_rent: 6000,
          joining_date: '2026-11-05',
          rent_start_date: '2026-11-05',
          next_payment_due_date: todayStr, // Due today for expiry day reminder test
          emergency_contact: 'Satya Varma (Brother)',
          emergency_phone: '+91 98765 99992',
          student_status: 'Active',
          created_at: '2026-11-05T10:00:00.000Z'
        },
        {
          id: 'stu-3',
          owner_id: owner1Id,
          user_id: null,
          student_id_code: 'STU-2026-003',
          full_name: 'Anil Reddy',
          mobile_number: '+91 98765 00003',
          email: 'anil.reddy@gmail.com',
          hostel_id: hostel2Id,
          room_id: room102Id,
          bed_id: 'bed-102-1',
          sharing_type: 2,
          agreed_monthly_rent: 7500,
          joining_date: '2026-11-10',
          rent_start_date: '2026-11-10',
          next_payment_due_date: '2026-12-10',
          emergency_contact: 'Venkat Reddy (Father)',
          emergency_phone: '+91 98765 99993',
          student_status: 'Active',
          created_at: '2026-11-10T10:00:00.000Z'
        },
        {
          id: 'stu-4',
          owner_id: owner1Id,
          user_id: null,
          student_id_code: 'STU-2026-004',
          full_name: 'Mahesh Babu',
          mobile_number: '+91 98765 00004',
          email: 'mahesh@gmail.com',
          hostel_id: hostel3Id,
          room_id: room205Id,
          bed_id: 'bed-205-1',
          sharing_type: 3,
          agreed_monthly_rent: 6000,
          joining_date: '2026-11-02',
          rent_start_date: '2026-11-02',
          next_payment_due_date: todayStr,
          emergency_contact: 'Siva Babu (Father)',
          emergency_phone: '+91 98765 99994',
          student_status: 'Active',
          created_at: '2026-11-02T11:00:00.000Z'
        },
        {
          id: 'stu-5',
          owner_id: owner1Id,
          user_id: null,
          student_id_code: 'STU-2026-005',
          full_name: 'Praveen Teja',
          mobile_number: '+91 98765 00005',
          email: 'praveen@gmail.com',
          hostel_id: hostel3Id,
          room_id: room205Id,
          bed_id: 'bed-205-2',
          sharing_type: 3,
          agreed_monthly_rent: 6000,
          joining_date: '2026-11-02',
          rent_start_date: '2026-11-02',
          next_payment_due_date: '2026-12-02',
          emergency_contact: 'Murali Teja (Uncle)',
          emergency_phone: '+91 98765 99995',
          student_status: 'Active',
          created_at: '2026-11-02T11:00:00.000Z'
        }
      ],
      payments: [
        {
          id: 'pay-001',
          student_id: 'stu-1',
          hostel_id: hostel1Id,
          room_id: room101Id,
          monthly_rent: 6000,
          amount_paid: 6000,
          pending_balance: 0,
          payment_date: '2026-11-01',
          payment_method: 'UPI',
          transaction_ref: 'UPI/20261101/887123',
          billing_cycle_month: 'November 2026',
          next_due_date: tomorrowStr,
          payment_status: 'Paid',
          receipt_number: 'RCP-2026-001',
          notes: 'Joining rent paid in full via Google Pay',
          created_at: '2026-11-01T10:30:00.000Z'
        },
        {
          id: 'pay-002',
          student_id: 'stu-3',
          hostel_id: hostel2Id,
          room_id: room102Id,
          monthly_rent: 7500,
          amount_paid: 7500,
          pending_balance: 0,
          payment_date: '2026-11-10',
          payment_method: 'Bank Transfer',
          transaction_ref: 'NEFT/HDFC/2026111001',
          billing_cycle_month: 'November 2026',
          next_due_date: '2026-12-10',
          payment_status: 'Paid',
          receipt_number: 'RCP-2026-002',
          notes: 'Full month rent received via HDFC Netbanking',
          created_at: '2026-11-10T11:00:00.000Z'
        }
      ],
      notification_logs: [],
      messaging_config: {
        provider: 'whatsapp_business',
        test_mode: true,
        api_endpoint: 'https://graph.facebook.com/v19.0/YOUR_PHONE_NUMBER_ID/messages',
        api_key_encrypted: 'TEST_WHATSAPP_TOKEN',
        sender_phone_number_id: '919848012345',
        sms_sender_id: 'NARASM'
      }
    };
  }

  // Database Service with atomic persistence
  class DatabaseService {
    constructor() {
      this.state = this.loadState();
      this.currentUser = this.loadCurrentUser();
      this.backendMode = localStorage.getItem(STORAGE_KEYS.BACKEND_MODE) || 'mock';
    }

    loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.DB);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.hostels) && Array.isArray(parsed.students)) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error loading mock database:', e);
      }
      const seed = getSeedDatabase();
      this.saveState(seed);
      return seed;
    }

    saveState(newState) {
      if (newState) this.state = newState;
      try {
        localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(this.state));
      } catch (err) {
        console.error('Error saving state to localStorage:', err);
      }
    }

    loadCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      // Default to demo owner 1
      const defaultOwner = {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'owner1@hostel.com',
        full_name: 'Narasimha Rao',
        role: 'owner'
      };
      this.saveCurrentUser(defaultOwner);
      return defaultOwner;
    }

    saveCurrentUser(user) {
      this.currentUser = user;
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }

    resetSampleData() {
      const fresh = getSeedDatabase();
      this.saveState(fresh);
      this.saveCurrentUser(fresh.profiles[0]);
      return fresh;
    }

    // Auth
    async signIn(email, password, role = null) {
      const user = this.state.profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.passwordHash !== password) {
        throw new Error('Invalid email or password.');
      }
      if (role && user.role !== role) {
        throw new Error(`Account is not registered as a ${role}. Please switch roles.`);
      }
      this.saveCurrentUser(user);
      return user;
    }

    async signUp(userData) {
      const existing = this.state.profiles.find(p => p.email.toLowerCase() === userData.email.trim().toLowerCase());
      if (existing) {
        throw new Error('User email already registered. Please sign in.');
      }
      const newProfile = {
        id: crypto.randomUUID(),
        email: userData.email.trim(),
        passwordHash: userData.password,
        full_name: userData.full_name.trim(),
        role: userData.role || 'owner',
        mobile_number: userData.mobile_number ? userData.mobile_number.trim() : null
      };
      this.state.profiles.push(newProfile);
      this.saveState();
      this.saveCurrentUser(newProfile);
      return newProfile;
    }

    signOut() {
      this.saveCurrentUser(null);
    }

    // Hostels CRUD (Module 1)
    getHostels() {
      if (!this.currentUser) return [];
      if (this.currentUser.role === 'student') {
        const student = this.state.students.find(s => s.user_id === this.currentUser.id || s.email.toLowerCase() === this.currentUser.email.toLowerCase());
        return student ? this.state.hostels.filter(h => h.id === student.hostel_id) : [];
      }
      return this.state.hostels.filter(h => h.owner_id === this.currentUser.id);
    }

    getHostelById(id) {
      return this.state.hostels.find(h => h.id === id);
    }

    createHostel(data) {
      if (!this.currentUser || this.currentUser.role !== 'owner') {
        throw new Error('Only hostel owners can create hostels');
      }
      const area = (data.area || '').trim();
      const city = (data.city || 'Hyderabad').trim();
      const state = (data.state || 'Telangana').trim();
      const pincode = (data.pincode || '').trim();
      const address = (data.address || '').trim();
      const fullAddressStr = `${address || area}, ${city}, ${state} - ${pincode}`;

      const newHostel = {
        id: crypto.randomUUID(),
        owner_id: this.currentUser.id,
        name: data.name.trim(),
        type: data.type || 'Boys',
        area,
        city,
        state,
        pincode,
        address,
        contact_number: (data.contact_number || '').trim(),
        maps_url: (data.maps_url || '').trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`,
        total_floors: parseInt(data.total_floors, 10) || 3,
        created_at: new Date().toISOString()
      };
      this.state.hostels.push(newHostel);

      // Initialize default floors for this hostel
      const defaultFloors = ['Ground Floor', '1st Floor', '2nd Floor'];
      defaultFloors.forEach((fl, idx) => {
        this.state.floors.push({
          id: crypto.randomUUID(),
          hostel_id: newHostel.id,
          floor_name: fl,
          floor_order: idx
        });
      });

      // Initialize default sharing pricing for this hostel (Module 3)
      [1, 2, 3, 4, 5].forEach(type => {
        this.state.pricing.push({
          id: crypto.randomUUID(),
          hostel_id: newHostel.id,
          sharing_type: type,
          price_per_person: SHARING_CONFIG[type].defaultRent
        });
      });

      this.saveState();
      return newHostel;
    }

    updateHostel(id, data) {
      const idx = this.state.hostels.findIndex(h => h.id === id && h.owner_id === this.currentUser.id);
      if (idx === -1) throw new Error('Hostel not found or access denied.');

      const existing = this.state.hostels[idx];
      const area = data.area !== undefined ? data.area.trim() : existing.area;
      const city = data.city !== undefined ? data.city.trim() : existing.city;
      const state = data.state !== undefined ? data.state.trim() : existing.state;
      const pincode = data.pincode !== undefined ? data.pincode.trim() : existing.pincode;
      const address = data.address !== undefined ? data.address.trim() : existing.address;
      const fullAddressStr = `${address || area}, ${city}, ${state} - ${pincode}`;

      const updated = {
        ...existing,
        name: data.name !== undefined ? data.name.trim() : existing.name,
        type: data.type !== undefined ? data.type : existing.type,
        area,
        city,
        state,
        pincode,
        address,
        contact_number: data.contact_number !== undefined ? data.contact_number.trim() : existing.contact_number,
        maps_url: (data.maps_url && data.maps_url.trim()) ? data.maps_url.trim() : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`,
        total_floors: data.total_floors !== undefined ? parseInt(data.total_floors, 10) : existing.total_floors
      };

      this.state.hostels[idx] = updated;
      this.saveState();
      return updated;
    }

    deleteHostel(id) {
      // Guard: Cannot delete if active students are assigned
      const activeStudents = this.state.students.filter(s => s.hostel_id === id && s.student_status === 'Active');
      if (activeStudents.length > 0) {
        throw new Error(`Cannot delete hostel: ${activeStudents.length} active resident student(s) currently reside here. Please vacate students first.`);
      }

      const hostelRooms = this.state.rooms.filter(r => r.hostel_id === id);
      const roomIds = hostelRooms.map(r => r.id);

      this.state.beds = this.state.beds.filter(b => !roomIds.includes(b.room_id));
      this.state.rooms = this.state.rooms.filter(r => r.hostel_id !== id);
      this.state.floors = this.state.floors.filter(f => f.hostel_id !== id);
      this.state.pricing = this.state.pricing.filter(p => p.hostel_id !== id);
      this.state.hostels = this.state.hostels.filter(h => h.id !== id);

      this.saveState();
      return true;
    }

    // Floors CRUD (Module 2)
    getFloors(hostelId = null) {
      if (hostelId && hostelId !== 'all') {
        const customFloors = this.state.floors.filter(f => f.hostel_id === hostelId).map(f => f.floor_name);
        return Array.from(new Set([...STANDARD_FLOORS, ...customFloors]));
      }
      return STANDARD_FLOORS;
    }

    addCustomFloor(hostelId, floorName) {
      const trimmed = floorName.trim();
      if (!trimmed) throw new Error('Floor name is required.');
      const existing = this.state.floors.find(f => f.hostel_id === hostelId && f.floor_name.toLowerCase() === trimmed.toLowerCase());
      if (existing) throw new Error(`Floor "${trimmed}" already exists for this hostel.`);

      const newFloor = {
        id: crypto.randomUUID(),
        hostel_id: hostelId,
        floor_name: trimmed,
        floor_order: this.state.floors.length
      };
      this.state.floors.push(newFloor);
      this.saveState();
      return newFloor;
    }

    // Sharing Pricing CRUD (Module 3)
    getPricing(hostelId) {
      const prices = this.state.pricing.filter(p => p.hostel_id === hostelId);
      const result = {};
      [1, 2, 3, 4, 5].forEach(type => {
        const found = prices.find(p => p.sharing_type === type);
        result[type] = found ? found.price_per_person : SHARING_CONFIG[type].defaultRent;
      });
      return result;
    }

    updatePricing(hostelId, pricingObj) {
      [1, 2, 3, 4, 5].forEach(type => {
        if (pricingObj[type] !== undefined) {
          const price = parseFloat(pricingObj[type]) || SHARING_CONFIG[type].defaultRent;
          const idx = this.state.pricing.findIndex(p => p.hostel_id === hostelId && p.sharing_type === type);
          if (idx !== -1) {
            this.state.pricing[idx].price_per_person = price;
          } else {
            this.state.pricing.push({
              id: crypto.randomUUID(),
              hostel_id: hostelId,
              sharing_type: type,
              price_per_person: price
            });
          }
        }
      });
      this.saveState();
      // Notice: Existing students' agreed_monthly_rent is untouched!
      return this.getPricing(hostelId);
    }

    // Rooms CRUD (Module 2)
    getRooms(hostelId = null) {
      const userHostels = this.getHostels();
      const userHostelIds = userHostels.map(h => h.id);

      let rooms = this.state.rooms.filter(r => userHostelIds.includes(r.hostel_id));
      if (hostelId && hostelId !== 'all') {
        rooms = rooms.filter(r => r.hostel_id === hostelId);
      }
      return rooms;
    }

    getRoomDetails(roomId) {
      const room = this.state.rooms.find(r => r.id === roomId);
      if (!room) return null;
      const hostel = this.state.hostels.find(h => h.id === room.hostel_id);
      const beds = this.state.beds.filter(b => b.room_id === roomId).sort((a, b) => a.bed_number - b.bed_number);
      
      const bedDetails = beds.map(bed => {
        const student = this.state.students.find(s => s.bed_id === bed.id && s.student_status === 'Active');
        const isOccupied = bed.status === 'Occupied' || !!student;
        return {
          ...bed,
          isOccupied,
          student: student || null
        };
      });

      const totalBeds = beds.length;
      const occupiedBeds = bedDetails.filter(b => b.isOccupied).length;
      const availableBeds = Math.max(0, totalBeds - occupiedBeds);
      const isAvailable = availableBeds > 0 && room.room_status !== 'Maintenance';

      let washroomLabel = 'None';
      if (room.attached_washroom && room.common_washroom) washroomLabel = 'Attached & Common';
      else if (room.attached_washroom) washroomLabel = 'Attached';
      else if (room.common_washroom) washroomLabel = 'Common';

      return {
        ...room,
        floor: room.floor_name || room.floor || 'Ground Floor',
        floor_name: room.floor_name || room.floor || 'Ground Floor',
        hostel,
        beds: bedDetails,
        totalBeds,
        occupiedBeds,
        availableBeds,
        isAvailable,
        availabilityStatus: availableBeds === 0 ? 'Full' : (room.room_status === 'Maintenance' ? 'Maintenance' : 'Available'),
        washroomLabel,
        acLabel: room.ac ? 'AC' : 'Non-AC',
        sharingLabel: SHARING_CONFIG[room.sharing_type]?.name || `${room.sharing_type} Sharing`
      };
    }

    createRoom(data) {
      const hostel = this.getHostelById(data.hostel_id);
      if (!hostel) throw new Error('Hostel not found.');

      const existing = this.state.rooms.find(r => r.hostel_id === data.hostel_id && r.room_number.toLowerCase() === data.room_number.trim().toLowerCase());
      if (existing) {
        throw new Error(`Room ${data.room_number} already exists in ${hostel.name}.`);
      }

      const sharingType = parseInt(data.sharing_type, 10) || 1;
      // Get configured price for this sharing type or fallback
      const hostelPrices = this.getPricing(data.hostel_id);
      const monthlyRent = data.monthly_rent !== undefined ? parseFloat(data.monthly_rent) : (hostelPrices[sharingType] || 6000);

      const newRoom = {
        id: crypto.randomUUID(),
        hostel_id: data.hostel_id,
        room_number: data.room_number.trim(),
        floor_name: data.floor_name || data.floor || 'Ground Floor',
        floor: data.floor_name || data.floor || 'Ground Floor',
        sharing_type: sharingType,
        monthly_rent: monthlyRent,
        ac: data.ac === true || data.ac === 'true' || data.ac === 'ac' || data.ac === 'AC',
        attached_washroom: data.attached_washroom === true || data.attached_washroom === 'true' || data.attached_washroom === 'yes' || data.attached_washroom === 'Yes',
        common_washroom: data.common_washroom === true || data.common_washroom === 'true' || data.common_washroom === 'yes' || data.common_washroom === 'Yes',
        room_status: data.room_status || 'Available',
        created_at: new Date().toISOString()
      };

      this.state.rooms.push(newRoom);

      // Auto generate beds 1..sharingType
      for (let i = 1; i <= sharingType; i++) {
        this.state.beds.push({
          id: crypto.randomUUID(),
          room_id: newRoom.id,
          bed_number: i,
          status: 'Available',
          created_at: new Date().toISOString()
        });
      }

      this.saveState();
      return newRoom;
    }

    updateRoom(roomId, data) {
      const idx = this.state.rooms.findIndex(r => r.id === roomId);
      if (idx === -1) throw new Error('Room not found.');

      const existing = this.state.rooms[idx];
      const newSharing = data.sharing_type ? parseInt(data.sharing_type, 10) : existing.sharing_type;

      // Bed capacity reduction check
      const currentBeds = this.state.beds.filter(b => b.room_id === roomId);
      if (newSharing < existing.sharing_type) {
        const bedsToRemove = currentBeds.filter(b => b.bed_number > newSharing);
        const bedIdsToRemove = bedsToRemove.map(b => b.id);
        const occupiedToRemove = this.state.students.filter(s => bedIdsToRemove.includes(s.bed_id) && s.student_status === 'Active');

        if (occupiedToRemove.length > 0) {
          throw new Error(`Cannot reduce room capacity to ${newSharing}: Bed slots above ${newSharing} are currently occupied by ${occupiedToRemove.map(s => s.full_name).join(', ')}. Please vacate them first.`);
        }

        this.state.beds = this.state.beds.filter(b => !bedIdsToRemove.includes(b.id));
      } else if (newSharing > existing.sharing_type) {
        for (let i = existing.sharing_type + 1; i <= newSharing; i++) {
          this.state.beds.push({
            id: crypto.randomUUID(),
            room_id: roomId,
            bed_number: i,
            status: 'Available',
            created_at: new Date().toISOString()
          });
        }
      }

      const updated = {
        ...existing,
        hostel_id: data.hostel_id !== undefined ? data.hostel_id : existing.hostel_id,
        room_number: data.room_number !== undefined ? data.room_number.trim() : existing.room_number,
        floor_name: data.floor_name !== undefined ? data.floor_name : (data.floor !== undefined ? data.floor : existing.floor_name),
        floor: data.floor_name !== undefined ? data.floor_name : (data.floor !== undefined ? data.floor : (existing.floor || existing.floor_name)),
        sharing_type: newSharing,
        monthly_rent: data.monthly_rent !== undefined ? parseFloat(data.monthly_rent) : existing.monthly_rent,
        ac: data.ac !== undefined ? (data.ac === true || data.ac === 'true' || data.ac === 'ac' || data.ac === 'AC') : existing.ac,
        attached_washroom: data.attached_washroom !== undefined ? (data.attached_washroom === true || data.attached_washroom === 'true' || data.attached_washroom === 'yes' || data.attached_washroom === 'Yes') : existing.attached_washroom,
        common_washroom: data.common_washroom !== undefined ? (data.common_washroom === true || data.common_washroom === 'true' || data.common_washroom === 'yes' || data.common_washroom === 'Yes') : existing.common_washroom,
        room_status: data.room_status !== undefined ? data.room_status : existing.room_status
      };

      this.state.rooms[idx] = updated;
      this.saveState();
      return updated;
    }

    deleteRoom(roomId) {
      const beds = this.state.beds.filter(b => b.room_id === roomId);
      const bedIds = beds.map(b => b.id);
      const activeStudents = this.state.students.filter(s => bedIds.includes(s.bed_id) && s.student_status === 'Active');

      if (activeStudents.length > 0) {
        throw new Error(`Cannot delete room: Bed slots are occupied by active student(s) (${activeStudents.map(s => s.full_name).join(', ')}). Vacate residents first.`);
      }

      this.state.beds = this.state.beds.filter(b => b.room_id !== roomId);
      this.state.rooms = this.state.rooms.filter(r => r.id !== roomId);
      this.saveState();
      return true;
    }

    // Students CRUD (Module 4)
    getStudents(filter = {}) {
      const userHostels = this.getHostels();
      const userHostelIds = userHostels.map(h => h.id);

      let students = this.state.students.filter(s => userHostelIds.includes(s.hostel_id));

      if (filter.hostel_id && filter.hostel_id !== 'all') {
        students = students.filter(s => s.hostel_id === filter.hostel_id);
      }
      if (filter.status && filter.status !== 'all') {
        students = students.filter(s => s.student_status === filter.status);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.trim().toLowerCase();
        students = students.filter(s => 
          s.full_name.toLowerCase().includes(q) ||
          s.mobile_number.includes(q) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          s.student_id_code.toLowerCase().includes(q)
        );
      }
      return students;
    }

    getStudentDetails(studentId) {
      const student = this.state.students.find(s => s.id === studentId);
      if (!student) return null;

      const hostel = this.state.hostels.find(h => h.id === student.hostel_id);
      const room = this.state.rooms.find(r => r.id === student.room_id);
      const bed = this.state.beds.find(b => b.id === student.bed_id);
      const payments = this.state.payments.filter(p => p.student_id === studentId).sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date));

      return {
        ...student,
        hostel,
        room,
        bed,
        payments
      };
    }

    addStudent(data) {
      if (!this.currentUser || this.currentUser.role !== 'owner') {
        throw new Error('Only owners can register students.');
      }

      // Check bed availability & prevent duplicate assignment
      const bed = this.state.beds.find(b => b.id === data.bed_id);
      if (!bed) throw new Error('Selected bed slot does not exist.');

      const activeResident = this.state.students.find(s => s.bed_id === data.bed_id && s.student_status === 'Active');
      if (activeResident) {
        throw new Error(`Bed ${bed.bed_number} is already occupied by ${activeResident.full_name}.`);
      }

      const room = this.state.rooms.find(r => r.id === data.room_id);
      if (!room) throw new Error('Selected room not found.');

      // Generate student ID code STU-2026-XXX
      const studentCount = this.state.students.length + 1;
      const studentCode = `STU-2026-${studentCount.toString().padStart(3, '0')}`;

      // Calculate next due date (default +1 month from joining or rent start)
      const startDate = data.rent_start_date || data.joining_date || new Date().toISOString().split('T')[0];
      const dueDateObj = new Date(startDate);
      dueDateObj.setMonth(dueDateObj.getMonth() + 1);
      const nextDueDate = data.next_payment_due_date || dueDateObj.toISOString().split('T')[0];

      const newStudent = {
        id: crypto.randomUUID(),
        owner_id: this.currentUser.id,
        user_id: null,
        student_id_code: studentCode,
        full_name: data.full_name.trim(),
        mobile_number: data.mobile_number.trim(),
        email: data.email ? data.email.trim() : `${data.full_name.toLowerCase().replace(/\s+/g, '')}@student.hostel`,
        hostel_id: data.hostel_id,
        room_id: data.room_id,
        bed_id: data.bed_id,
        sharing_type: room.sharing_type,
        agreed_monthly_rent: parseFloat(data.agreed_monthly_rent) || room.monthly_rent,
        joining_date: data.joining_date || new Date().toISOString().split('T')[0],
        rent_start_date: startDate,
        next_payment_due_date: nextDueDate,
        emergency_contact: data.emergency_contact ? data.emergency_contact.trim() : null,
        emergency_phone: data.emergency_phone ? data.emergency_phone.trim() : null,
        student_status: 'Active',
        created_at: new Date().toISOString()
      };

      this.state.students.push(newStudent);
      bed.status = 'Occupied';

      // Create linked student profile for student login portal
      const studentProfile = {
        id: crypto.randomUUID(),
        email: newStudent.email,
        passwordHash: 'student123',
        full_name: newStudent.full_name,
        role: 'student',
        mobile_number: newStudent.mobile_number
      };
      newStudent.user_id = studentProfile.id;
      this.state.profiles.push(studentProfile);

      this.saveState();
      return newStudent;
    }

    updateStudent(studentId, data) {
      const idx = this.state.students.findIndex(s => s.id === studentId);
      if (idx === -1) throw new Error('Student not found.');

      const existing = this.state.students[idx];

      // If bed changed, handle release of old bed and occupation of new bed
      if (data.bed_id && data.bed_id !== existing.bed_id) {
        const oldBed = this.state.beds.find(b => b.id === existing.bed_id);
        const newBed = this.state.beds.find(b => b.id === data.bed_id);
        if (!newBed) throw new Error('Target bed slot does not exist.');

        const occupied = this.state.students.find(s => s.bed_id === data.bed_id && s.id !== studentId && s.student_status === 'Active');
        if (occupied) throw new Error(`Target bed is already occupied by ${occupied.full_name}.`);

        if (oldBed) oldBed.status = 'Available';
        newBed.status = 'Occupied';
      }

      const updated = {
        ...existing,
        full_name: data.full_name !== undefined ? data.full_name.trim() : existing.full_name,
        mobile_number: data.mobile_number !== undefined ? data.mobile_number.trim() : existing.mobile_number,
        email: data.email !== undefined ? data.email.trim() : existing.email,
        room_id: data.room_id !== undefined ? data.room_id : existing.room_id,
        bed_id: data.bed_id !== undefined ? data.bed_id : existing.bed_id,
        agreed_monthly_rent: data.agreed_monthly_rent !== undefined ? parseFloat(data.agreed_monthly_rent) : existing.agreed_monthly_rent,
        next_payment_due_date: data.next_payment_due_date !== undefined ? data.next_payment_due_date : existing.next_payment_due_date,
        emergency_contact: data.emergency_contact !== undefined ? data.emergency_contact.trim() : existing.emergency_contact,
        emergency_phone: data.emergency_phone !== undefined ? data.emergency_phone.trim() : existing.emergency_phone,
        student_status: data.student_status !== undefined ? data.student_status : existing.student_status
      };

      this.state.students[idx] = updated;
      this.saveState();
      return updated;
    }

    vacateStudent(studentId) {
      const student = this.state.students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found.');

      student.student_status = 'Vacated';
      student.vacated_date = new Date().toISOString().split('T')[0];

      // Release bed
      const bed = this.state.beds.find(b => b.id === student.bed_id);
      if (bed) {
        bed.status = 'Available';
      }

      this.saveState();
      return student;
    }

    deleteStudent(studentId) {
      const student = this.state.students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found.');

      // Release bed if occupied
      const bed = this.state.beds.find(b => b.id === student.bed_id);
      if (bed) {
        bed.status = 'Available';
      }

      this.state.students = this.state.students.filter(s => s.id !== studentId);
      this.state.payments = this.state.payments.filter(p => p.student_id !== studentId);
      this.saveState();
      return true;
    }

    // Baseline Compatibility Helpers
    assignResident(bedId, residentData) {
      const bed = this.state.beds.find(b => b.id === bedId);
      if (!bed) throw new Error('Bed not found');
      const room = this.state.rooms.find(r => r.id === bed.room_id);
      if (!room) throw new Error('Room not found');

      const existingActive = this.state.students.find(s => s.bed_id === bedId && s.student_status === 'Active');
      if (existingActive) throw new Error(`Bed is already occupied by ${existingActive.full_name}.`);

      return this.addStudent({
        hostel_id: room.hostel_id,
        room_id: room.id,
        bed_id: bedId,
        full_name: residentData.resident_name || residentData.full_name || 'Resident',
        mobile_number: residentData.mobile_number || '+91 99999 99999',
        agreed_monthly_rent: room.monthly_rent,
        joining_date: residentData.move_in_date || new Date().toISOString().split('T')[0]
      });
    }

    checkoutResident(bedId) {
      const student = this.state.students.find(s => s.bed_id === bedId && s.student_status === 'Active');
      if (!student) throw new Error('No active resident found on this bed.');
      return this.vacateStudent(student.id);
    }

    // Payments CRUD (Module 6 & 7)
    getPayments(filter = {}) {
      const userHostels = this.getHostels();
      const userHostelIds = userHostels.map(h => h.id);

      let payments = this.state.payments.filter(p => userHostelIds.includes(p.hostel_id));

      if (filter.hostel_id && filter.hostel_id !== 'all') {
        payments = payments.filter(p => p.hostel_id === filter.hostel_id);
      }
      if (filter.student_id) {
        payments = payments.filter(p => p.student_id === filter.student_id);
      }
      if (filter.status && filter.status !== 'all') {
        payments = payments.filter(p => p.payment_status === filter.status);
      }

      return payments.sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date));
    }

    recordPayment(data) {
      const student = this.state.students.find(s => s.id === data.student_id);
      if (!student) throw new Error('Student record not found.');

      const amountPaid = parseFloat(data.amount_paid);
      if (isNaN(amountPaid) || amountPaid <= 0) {
        throw new Error('Please enter a valid positive payment amount.');
      }

      const rent = parseFloat(student.agreed_monthly_rent) || 0;
      const pendingBalance = Math.max(0, rent - amountPaid);
      const paymentStatus = pendingBalance === 0 ? 'Paid' : 'Partial';

      // Advance due date by 1 month
      const currentDue = new Date(student.next_payment_due_date);
      currentDue.setMonth(currentDue.getMonth() + 1);
      const nextDueStr = currentDue.toISOString().split('T')[0];

      const receiptNumber = 'RCP-2026-' + (this.state.payments.length + 1).toString().padStart(3, '0');

      const payment = {
        id: crypto.randomUUID(),
        student_id: student.id,
        hostel_id: student.hostel_id,
        room_id: student.room_id,
        monthly_rent: rent,
        amount_paid: amountPaid,
        pending_balance: pendingBalance,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
        payment_method: data.payment_method || 'UPI',
        transaction_ref: data.transaction_ref ? data.transaction_ref.trim() : null,
        billing_cycle_month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        next_due_date: nextDueStr,
        payment_status: paymentStatus,
        receipt_number: receiptNumber,
        notes: data.notes ? data.notes.trim() : null,
        created_at: new Date().toISOString()
      };

      this.state.payments.push(payment);

      // Update student due date & advance billing cycle
      student.next_payment_due_date = nextDueStr;

      this.saveState();
      return payment;
    }

    // Reminders & Notifications (Module 5)
    runDailyReminders() {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
      const formatter = new Intl.DateTimeFormat('en-CA', options);
      const todayStr = formatter.format(now);

      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatter.format(tomorrow);

      let count = 0;
      this.state.students.forEach(student => {
        if (student.student_status !== 'Active') return;
        const hostel = this.getHostelById(student.hostel_id) || { name: 'Narasimha PG' };
        const dueDate = student.next_payment_due_date;
        const amount = Number(student.agreed_monthly_rent).toLocaleString('en-IN');

        // Check A: One Day Before Due Date
        if (dueDate === tomorrowStr) {
          const exists = this.state.notification_logs.find(n => 
            n.student_id === student.id &&
            n.reminder_type === 'one_day_before' &&
            n.due_date === dueDate
          );

          if (!exists) {
            const msg = `Hello ${student.full_name},\n\nYour hostel rent payment is due tomorrow (${dueDate}).\n\nYour monthly hostel rent is ₹${amount}.\n\nKindly complete your payment tomorrow to avoid any inconvenience.\n\nThank you.\n${hostel.name}`;
            this.state.notification_logs.push({
              id: crypto.randomUUID(),
              student_id: student.id,
              hostel_id: student.hostel_id,
              reminder_type: 'one_day_before',
              due_date: dueDate,
              recipient_mobile: student.mobile_number,
              channel: 'WhatsApp',
              message_body: msg,
              status: this.state.messaging_config.test_mode ? 'Simulated' : 'Sent',
              sent_at: new Date().toISOString()
            });
            count++;
          }
        }

        // Check B: On Expiry / Due Date
        if (dueDate === todayStr) {
          const exists = this.state.notification_logs.find(n => 
            n.student_id === student.id &&
            n.reminder_type === 'due_date' &&
            n.due_date === dueDate
          );

          if (!exists) {
            const msg = `Hello ${student.full_name},\n\nToday is your hostel rent payment due date.\n\nYour payment of ₹${amount} is due today.\n\nKindly make your payment today.\n\nThank you.\n${hostel.name}`;
            this.state.notification_logs.push({
              id: crypto.randomUUID(),
              student_id: student.id,
              hostel_id: student.hostel_id,
              reminder_type: 'due_date',
              due_date: dueDate,
              recipient_mobile: student.mobile_number,
              channel: 'WhatsApp',
              message_body: msg,
              status: this.state.messaging_config.test_mode ? 'Simulated' : 'Sent',
              sent_at: new Date().toISOString()
            });
            count++;
          }
        }
      });

      if (count > 0) this.saveState();
      return { sent: count, today: todayStr, tomorrow: tomorrowStr };
    }

    sendManualReminder(studentId) {
      const student = this.state.students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found.');
      const hostel = this.getHostelById(student.hostel_id) || { name: 'Narasimha PG' };
      const amount = Number(student.agreed_monthly_rent).toLocaleString('en-IN');
      const dueDate = student.next_payment_due_date;

      const msg = `Hello ${student.full_name},\n\nThis is a friendly reminder that your monthly hostel rent payment of ₹${amount} for ${hostel.name} is scheduled for ${dueDate}.\n\nKindly make your payment to avoid any inconvenience.\n\nThank you,\n${hostel.name}`;

      const log = {
        id: crypto.randomUUID(),
        student_id: student.id,
        hostel_id: student.hostel_id,
        reminder_type: 'manual',
        due_date: dueDate,
        recipient_mobile: student.mobile_number,
        channel: 'WhatsApp',
        message_body: msg,
        status: this.state.messaging_config.test_mode ? 'Simulated' : 'Sent',
        sent_at: new Date().toISOString()
      };

      this.state.notification_logs.push(log);
      this.saveState();
      return { log, whatsappUrl: `https://wa.me/${student.mobile_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}` };
    }

    // Analytics & Metrics (Module 6 & 8)
    getFinancialMetrics(hostelId = null) {
      const userHostels = this.getHostels();
      const targetHostels = (hostelId && hostelId !== 'all') ? userHostels.filter(h => h.id === hostelId) : userHostels;
      const targetHostelIds = targetHostels.map(h => h.id);

      const activeStudents = this.state.students.filter(s => targetHostelIds.includes(s.hostel_id) && s.student_status === 'Active');
      const allPayments = this.state.payments.filter(p => targetHostelIds.includes(p.hostel_id));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      let totalExpectedRevenue = 0;
      activeStudents.forEach(s => {
        totalExpectedRevenue += (parseFloat(s.agreed_monthly_rent) || 0);
      });

      let totalRentCollected = 0;
      allPayments.forEach(p => {
        totalRentCollected += (parseFloat(p.amount_paid) || 0);
      });

      let dueTomorrowStudents = 0;
      let dueTodayStudents = 0;
      let overdueStudents = 0;
      let paidStudentsCount = 0;

      activeStudents.forEach(s => {
        if (s.next_payment_due_date === tomorrowStr) dueTomorrowStudents++;
        else if (s.next_payment_due_date === todayStr) dueTodayStudents++;
        else if (s.next_payment_due_date < todayStr) overdueStudents++;
        else paidStudentsCount++;
      });

      const pendingRevenue = Math.max(0, totalExpectedRevenue - totalRentCollected);

      return {
        totalExpectedRevenue,
        totalRentCollected,
        pendingRevenue,
        overdueCount: overdueStudents,
        dueTodayCount: dueTodayStudents,
        dueTomorrowCount: dueTomorrowStudents,
        paidCount: paidStudentsCount,
        unpaidCount: activeStudents.length - paidStudentsCount,
        totalActiveStudents: activeStudents.length
      };
    }

    getGeneralMetrics(hostelId = null) {
      const userHostels = this.getHostels();
      const targetHostels = (hostelId && hostelId !== 'all') ? userHostels.filter(h => h.id === hostelId) : userHostels;
      const targetHostelIds = targetHostels.map(h => h.id);

      const rooms = this.state.rooms.filter(r => targetHostelIds.includes(r.hostel_id));
      const roomIds = rooms.map(r => r.id);
      const beds = this.state.beds.filter(b => roomIds.includes(b.room_id));
      const students = this.state.students.filter(s => targetHostelIds.includes(s.hostel_id));

      const totalRooms = rooms.length;
      const totalBeds = beds.length;
      const activeStudents = students.filter(s => s.student_status === 'Active');
      const occupiedBeds = beds.filter(b => b.status === 'Occupied' || activeStudents.some(s => s.bed_id === b.id)).length;
      const availableBeds = Math.max(0, totalBeds - occupiedBeds);
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      return {
        totalHostels: targetHostels.length,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        vacatedStudents: students.filter(s => s.student_status === 'Vacated').length
      };
    }
  }

  // Window Export for Tests and Controllers
  window.DatabaseService = DatabaseService;
  window.SHARING_CONFIG = SHARING_CONFIG;
  window.STANDARD_FLOORS = STANDARD_FLOORS;
})();

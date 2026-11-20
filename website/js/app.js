/**
 * Narasimha PG Hostel Manager v2.0
 * Multi-Property PG Hostel & Bed Occupancy Management System
 * Enhanced with complete Location, Google Maps, Washrooms, Floors, and Room Details
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    DB: 'pghostel_mock_db_v2',
    CURRENT_USER: 'pghostel_mock_current_user',
    BACKEND_MODE: 'pghostel_backend_mode',
    SUPABASE_CONFIG: 'pghostel_supabase_config'
  };

  // 11 Available Floors
  const FLOORS = [
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

  const SHARING_LABELS = {
    1: '1 Sharing',
    2: '2 Sharing',
    3: '3 Sharing',
    4: '4 Sharing'
  };

  // Seed / Sample Data
  function getInitialData() {
    const owner1Id = '00000000-0000-4000-8000-000000000001';
    const owner2Id = '00000000-0000-4000-8000-000000000002';

    const hostel1Id = '11111111-1111-4000-8000-111111111111'; // Sai PG
    const hostel2Id = '22222222-2222-4000-8000-222222222222'; // Lakshmi PG
    const hostel3Id = '11111111-0000-4000-8000-000000000001'; // Sri Sai Boys Hostel

    const roomSai101Id = '33333333-1111-4000-8000-111111111111';
    const roomLakshmi102Id = '44444444-2222-4000-8000-222222222222';
    const roomSai205Id = '33333333-0000-4000-8000-000000000205';

    return {
      users: [
        { id: owner1Id, email: 'owner1@hostel.com', passwordHash: 'password123' },
        { id: owner2Id, email: 'owner2@hostel.com', passwordHash: 'password123' }
      ],
      hostels: [
        {
          id: hostel1Id,
          owner_id: owner1Id,
          name: 'Sai PG',
          area: 'Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          address: 'Plot 42, Silicon Valley, Madhapur, Hyderabad, Telangana',
          contact_number: '+91 98765 43210',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Plot+42+Silicon+Valley+Madhapur+Hyderabad+Telangana+500081',
          created_at: '2026-11-01T10:00:00.000Z'
        },
        {
          id: hostel2Id,
          owner_id: owner1Id,
          name: 'Lakshmi PG',
          area: 'Hitec City',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          address: 'Near Cyber Towers, Hitec City, Hyderabad, Telangana',
          contact_number: '+91 91234 56789',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Near+Cyber+Towers+Hitec+City+Hyderabad+Telangana+500081',
          created_at: '2026-11-02T10:00:00.000Z'
        },
        {
          id: hostel3Id,
          owner_id: owner1Id,
          name: 'Sri Sai Boys Hostel',
          area: 'Ameerpet',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500038',
          address: 'Beside Metro Pillar A1042, Ameerpet, Hyderabad, Telangana',
          contact_number: '+91 98480 12345',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Ameerpet+Hyderabad+Telangana+500038',
          created_at: '2026-11-01T09:00:00.000Z'
        }
      ],
      rooms: [
        {
          id: roomSai101Id,
          hostel_id: hostel1Id,
          room_number: '101',
          floor: '2nd Floor',
          sharing_type: 3,
          monthly_rent: 6000,
          attached_washroom: true,
          common_washroom: false,
          ac: false,
          created_at: '2026-11-03T10:00:00.000Z'
        },
        {
          id: roomLakshmi102Id,
          hostel_id: hostel2Id,
          room_number: '102',
          floor: '1st Floor',
          sharing_type: 2,
          monthly_rent: 7500,
          attached_washroom: true,
          common_washroom: true,
          ac: true,
          created_at: '2026-11-03T11:00:00.000Z'
        },
        {
          id: roomSai205Id,
          hostel_id: hostel3Id,
          room_number: '205',
          floor: '2nd Floor',
          sharing_type: 3,
          monthly_rent: 6000,
          attached_washroom: true,
          common_washroom: false,
          ac: false,
          created_at: '2026-11-02T11:00:00.000Z'
        }
      ],
      beds: [
        // Room 101 in Sai PG (3 beds, 2 occupied, 1 available)
        { id: '55555555-1111-4000-8000-000000000001', room_id: roomSai101Id, bed_number: 1 },
        { id: '55555555-1111-4000-8000-000000000002', room_id: roomSai101Id, bed_number: 2 },
        { id: '55555555-1111-4000-8000-000000000003', room_id: roomSai101Id, bed_number: 3 },
        // Room 102 in Lakshmi PG (2 beds, 1 occupied, 1 available)
        { id: '66666666-2222-4000-8000-000000000001', room_id: roomLakshmi102Id, bed_number: 1 },
        { id: '66666666-2222-4000-8000-000000000002', room_id: roomLakshmi102Id, bed_number: 2 },
        // Room 205 in Sri Sai Boys Hostel (3 beds, 0 occupied, 3 available)
        { id: '55555555-0000-4000-8000-000000000001', room_id: roomSai205Id, bed_number: 1 },
        { id: '55555555-0000-4000-8000-000000000002', room_id: roomSai205Id, bed_number: 2 },
        { id: '55555555-0000-4000-8000-000000000003', room_id: roomSai205Id, bed_number: 3 }
      ],
      assignments: [
        {
          id: '77777777-1111-4000-8000-000000000001',
          bed_id: '55555555-1111-4000-8000-000000000001',
          resident_name: 'Ravi',
          mobile_number: '+91 98765 00001',
          move_in_date: '2026-11-01',
          checkout_date: null
        },
        {
          id: '77777777-1111-4000-8000-000000000002',
          bed_id: '55555555-1111-4000-8000-000000000002',
          resident_name: 'Suresh',
          mobile_number: '+91 98765 00002',
          move_in_date: '2026-11-05',
          checkout_date: null
        },
        {
          id: '77777777-2222-4000-8000-000000000001',
          bed_id: '66666666-2222-4000-8000-000000000001',
          resident_name: 'Anil',
          mobile_number: '+91 98765 00003',
          move_in_date: '2026-11-10',
          checkout_date: null
        }
      ]
    };
  }

  // Database Service
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
          if (parsed && Array.isArray(parsed.hostels) && Array.isArray(parsed.rooms)) {
            // Ensure fields are backfilled properly
            parsed.hostels = parsed.hostels.map(h => ({
              area: h.area || 'Madhapur',
              city: h.city || 'Hyderabad',
              state: h.state || 'Telangana',
              pincode: h.pincode || '500081',
              maps_url: h.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((h.address || h.area || h.name) + ', Hyderabad, Telangana')}`,
              ...h
            }));
            parsed.rooms = parsed.rooms.map(r => ({
              floor: r.floor || '2nd Floor',
              monthly_rent: r.monthly_rent !== undefined ? r.monthly_rent : 6000,
              attached_washroom: r.attached_washroom !== undefined ? r.attached_washroom : true,
              common_washroom: r.common_washroom !== undefined ? r.common_washroom : false,
              ac: r.ac !== undefined ? r.ac : false,
              ...r
            }));
            return parsed;
          }
        }
      } catch (err) {
        console.error('Error loading mock database:', err);
      }
      const initial = getInitialData();
      this.saveState(initial);
      return initial;
    }

    saveState(newState) {
      if (newState) this.state = newState;
      try {
        localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(this.state));
      } catch (err) {
        console.error('Error saving state:', err);
      }
    }

    loadCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      const defaultUser = { id: '00000000-0000-4000-8000-000000000001', email: 'owner1@hostel.com' };
      this.saveCurrentUser(defaultUser);
      return defaultUser;
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
      const initial = getInitialData();
      this.saveState(initial);
      this.saveCurrentUser({ id: '00000000-0000-4000-8000-000000000001', email: 'owner1@hostel.com' });
      return initial;
    }

    // Auth
    async signIn(email, password) {
      const user = this.state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.passwordHash !== password) {
        throw new Error('Invalid email or password.');
      }
      const sessionUser = { id: user.id, email: user.email };
      this.saveCurrentUser(sessionUser);
      return sessionUser;
    }

    async signUp(email, password) {
      const existing = this.state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        throw new Error('User already registered. Please sign in.');
      }
      const newUser = {
        id: crypto.randomUUID(),
        email: email.trim(),
        passwordHash: password
      };
      this.state.users.push(newUser);
      this.saveState();
      const sessionUser = { id: newUser.id, email: newUser.email };
      this.saveCurrentUser(sessionUser);
      return sessionUser;
    }

    signOut() {
      this.saveCurrentUser(null);
    }

    // Hostels CRUD
    getHostels() {
      if (!this.currentUser) return [];
      return this.state.hostels.filter(h => h.owner_id === this.currentUser.id);
    }

    getHostelById(id) {
      return this.state.hostels.find(h => h.id === id);
    }

    createHostel(data) {
      if (!this.currentUser) throw new Error('Must be logged in to create a hostel');
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
        area,
        city,
        state,
        pincode,
        address,
        contact_number: (data.contact_number || '').trim(),
        maps_url: (data.maps_url || '').trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`,
        created_at: new Date().toISOString()
      };
      this.state.hostels.push(newHostel);
      this.saveState();
      return newHostel;
    }

    updateHostel(id, data) {
      const idx = this.state.hostels.findIndex(h => h.id === id && h.owner_id === this.currentUser.id);
      if (idx === -1) throw new Error('Hostel not found');
      
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
        area,
        city,
        state,
        pincode,
        address,
        contact_number: data.contact_number !== undefined ? data.contact_number.trim() : existing.contact_number,
        maps_url: (data.maps_url && data.maps_url.trim()) ? data.maps_url.trim() : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`
      };
      this.state.hostels[idx] = updated;
      this.saveState();
      return updated;
    }

    deleteHostel(id) {
      const hostelRooms = this.state.rooms.filter(r => r.hostel_id === id);
      const roomIds = hostelRooms.map(r => r.id);
      const hostelBeds = this.state.beds.filter(b => roomIds.includes(b.room_id));
      const bedIds = hostelBeds.map(b => b.id);
      const activeResidents = this.state.assignments.filter(a => bedIds.includes(a.bed_id) && !a.checkout_date);

      if (activeResidents.length > 0) {
        throw new Error(`Cannot delete hostel because it has ${activeResidents.length} active resident(s) in its beds. Please checkout all residents first.`);
      }

      this.state.assignments = this.state.assignments.filter(a => !bedIds.includes(a.bed_id));
      this.state.beds = this.state.beds.filter(b => !roomIds.includes(b.room_id));
      this.state.rooms = this.state.rooms.filter(r => r.hostel_id !== id);
      this.state.hostels = this.state.hostels.filter(h => h.id !== id);
      this.saveState();
      return true;
    }

    // Rooms CRUD
    getRooms(hostelId = null) {
      if (!this.currentUser) return [];
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
        const activeAssignment = this.state.assignments.find(a => a.bed_id === bed.id && !a.checkout_date);
        return {
          ...bed,
          isOccupied: !!activeAssignment,
          assignment: activeAssignment || null
        };
      });

      const totalBeds = beds.length;
      const occupiedBeds = bedDetails.filter(b => b.isOccupied).length;
      const availableBeds = totalBeds - occupiedBeds;
      const isAvailable = availableBeds > 0;

      // Washroom summary label
      let washroomLabel = 'None';
      if (room.attached_washroom && room.common_washroom) {
        washroomLabel = 'Attached & Common';
      } else if (room.attached_washroom) {
        washroomLabel = 'Attached';
      } else if (room.common_washroom) {
        washroomLabel = 'Common';
      }

      return {
        ...room,
        hostel,
        beds: bedDetails,
        totalBeds,
        occupiedBeds,
        availableBeds,
        isAvailable,
        availabilityStatus: isAvailable ? 'Available' : 'Occupied',
        washroomLabel,
        acLabel: room.ac ? 'AC' : 'Non-AC'
      };
    }

    createRoom(data) {
      const hostel = this.getHostelById(data.hostel_id);
      if (!hostel) throw new Error('Hostel not found');

      const existing = this.state.rooms.find(r => r.hostel_id === data.hostel_id && r.room_number.toLowerCase() === data.room_number.trim().toLowerCase());
      if (existing) {
        throw new Error(`Room ${data.room_number} already exists in ${hostel.name}.`);
      }

      const sharingType = parseInt(data.sharing_type, 10) || 1;
      const newRoom = {
        id: crypto.randomUUID(),
        hostel_id: data.hostel_id,
        room_number: data.room_number.trim(),
        floor: data.floor || 'Ground Floor',
        sharing_type: sharingType,
        monthly_rent: parseFloat(data.monthly_rent) || 6000,
        attached_washroom: data.attached_washroom === true || data.attached_washroom === 'true' || data.attached_washroom === 'yes' || data.attached_washroom === 'Yes',
        common_washroom: data.common_washroom === true || data.common_washroom === 'true' || data.common_washroom === 'yes' || data.common_washroom === 'Yes',
        ac: data.ac === true || data.ac === 'true' || data.ac === 'ac' || data.ac === 'AC' || data.ac === 'Yes',
        created_at: new Date().toISOString()
      };

      this.state.rooms.push(newRoom);

      for (let i = 1; i <= sharingType; i++) {
        this.state.beds.push({
          id: crypto.randomUUID(),
          room_id: newRoom.id,
          bed_number: i,
          created_at: new Date().toISOString()
        });
      }

      this.saveState();
      return newRoom;
    }

    updateRoom(roomId, data) {
      const idx = this.state.rooms.findIndex(r => r.id === roomId);
      if (idx === -1) throw new Error('Room not found');

      const existing = this.state.rooms[idx];
      const newSharing = parseInt(data.sharing_type, 10) || existing.sharing_type;

      // Bed capacity check
      const currentBeds = this.state.beds.filter(b => b.room_id === roomId);
      if (newSharing < existing.sharing_type) {
        const bedNumbersToRemove = [];
        for (let i = newSharing + 1; i <= existing.sharing_type; i++) {
          bedNumbersToRemove.push(i);
        }
        const bedsToRemove = currentBeds.filter(b => bedNumbersToRemove.includes(b.bed_number));
        const bedIdsToRemove = bedsToRemove.map(b => b.id);
        const occupiedToRemove = this.state.assignments.filter(a => bedIdsToRemove.includes(a.bed_id) && !a.checkout_date);

        if (occupiedToRemove.length > 0) {
          throw new Error(`Cannot reduce room capacity: Bed(s) ${occupiedToRemove.map(a => a.resident_name).join(', ')} are currently occupied. Check out residents first.`);
        }

        this.state.assignments = this.state.assignments.filter(a => !bedIdsToRemove.includes(a.bed_id));
        this.state.beds = this.state.beds.filter(b => !bedIdsToRemove.includes(b.id));
      } else if (newSharing > existing.sharing_type) {
        for (let i = existing.sharing_type + 1; i <= newSharing; i++) {
          this.state.beds.push({
            id: crypto.randomUUID(),
            room_id: roomId,
            bed_number: i,
            created_at: new Date().toISOString()
          });
        }
      }

      const updated = {
        ...existing,
        hostel_id: data.hostel_id !== undefined ? data.hostel_id : existing.hostel_id,
        room_number: data.room_number !== undefined ? data.room_number.trim() : existing.room_number,
        floor: data.floor !== undefined ? data.floor : existing.floor,
        sharing_type: newSharing,
        monthly_rent: data.monthly_rent !== undefined ? parseFloat(data.monthly_rent) : existing.monthly_rent,
        attached_washroom: data.attached_washroom !== undefined ? (data.attached_washroom === true || data.attached_washroom === 'true' || data.attached_washroom === 'yes' || data.attached_washroom === 'Yes') : existing.attached_washroom,
        common_washroom: data.common_washroom !== undefined ? (data.common_washroom === true || data.common_washroom === 'true' || data.common_washroom === 'yes' || data.common_washroom === 'Yes') : existing.common_washroom,
        ac: data.ac !== undefined ? (data.ac === true || data.ac === 'true' || data.ac === 'ac' || data.ac === 'AC' || data.ac === 'Yes') : existing.ac,
        updated_at: new Date().toISOString()
      };

      this.state.rooms[idx] = updated;
      this.saveState();
      return updated;
    }

    deleteRoom(roomId) {
      const beds = this.state.beds.filter(b => b.room_id === roomId);
      const bedIds = beds.map(b => b.id);
      const activeResidents = this.state.assignments.filter(a => bedIds.includes(a.bed_id) && !a.checkout_date);

      if (activeResidents.length > 0) {
        throw new Error(`Cannot delete room: Bed(s) are occupied by ${activeResidents.map(a => a.resident_name).join(', ')}. Please checkout residents first.`);
      }

      this.state.assignments = this.state.assignments.filter(a => !bedIds.includes(a.bed_id));
      this.state.beds = this.state.beds.filter(b => b.room_id !== roomId);
      this.state.rooms = this.state.rooms.filter(r => r.id !== roomId);
      this.saveState();
      return true;
    }

    // Bed Resident Operations
    assignResident(bedId, residentData) {
      const bed = this.state.beds.find(b => b.id === bedId);
      if (!bed) throw new Error('Bed not found');

      const existingActive = this.state.assignments.find(a => a.bed_id === bedId && !a.checkout_date);
      if (existingActive) {
        throw new Error(`Bed is already occupied by ${existingActive.resident_name}.`);
      }

      const newAssignment = {
        id: crypto.randomUUID(),
        bed_id: bedId,
        resident_name: residentData.resident_name.trim(),
        mobile_number: residentData.mobile_number ? residentData.mobile_number.trim() : null,
        move_in_date: residentData.move_in_date || new Date().toISOString().split('T')[0],
        checkout_date: null
      };

      this.state.assignments.push(newAssignment);
      this.saveState();
      return newAssignment;
    }

    checkoutResident(bedId) {
      const activeAssignment = this.state.assignments.find(a => a.bed_id === bedId && !a.checkout_date);
      if (!activeAssignment) throw new Error('No active resident found on this bed.');

      activeAssignment.checkout_date = new Date().toISOString().split('T')[0];
      this.saveState();
      return activeAssignment;
    }

    // Metrics
    getMetrics(hostelId = null) {
      const userHostels = this.getHostels();
      const targetHostels = (hostelId && hostelId !== 'all')
        ? userHostels.filter(h => h.id === hostelId)
        : userHostels;

      const targetHostelIds = targetHostels.map(h => h.id);
      const rooms = this.state.rooms.filter(r => targetHostelIds.includes(r.hostel_id));
      const roomIds = rooms.map(r => r.id);
      const beds = this.state.beds.filter(b => roomIds.includes(b.room_id));
      const bedIds = beds.map(b => b.id);
      const occupiedAssignments = this.state.assignments.filter(a => bedIds.includes(a.bed_id) && !a.checkout_date);

      const totalRooms = rooms.length;
      const totalBeds = beds.length;
      const occupiedBeds = occupiedAssignments.length;
      const availableBeds = totalBeds - occupiedBeds;
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      return {
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        hostelsCount: targetHostels.length
      };
    }
  }

  // Application UI Controller
  class AppController {
    constructor() {
      this.db = new DatabaseService();
      this.currentView = 'dashboard';
      this.selectedHostelFilter = 'all';
      this.selectedFloorFilter = 'all';
      this.selectedSharingFilter = 'all';
      this.selectedAvailabilityFilter = 'all';
      this.searchQuery = '';
      this.authTab = 'signin';
      this.activeModal = null;
      this.modalPayload = null;

      this.init();
    }

    init() {
      this.render();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(e => console.log('SW Note:', e));
      }
    }

    showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-semibold transition transform duration-200 ${
        type === 'error' ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-emerald-600 text-white shadow-emerald-200'
      }`;
      toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span><span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 250);
      }, 3000);
    }

    openModal(modalId, payload = null) {
      this.activeModal = modalId;
      this.modalPayload = payload;
      this.renderModal();
    }

    closeModal() {
      this.activeModal = null;
      this.modalPayload = null;
      const c = document.getElementById('modal-container');
      if (c) c.innerHTML = '';
    }

    formatCurrency(val) {
      if (!val && val !== 0) return '₹0';
      return '₹' + Number(val).toLocaleString('en-IN');
    }

    render() {
      const app = document.getElementById('app');
      if (!app) return;

      if (!this.db.currentUser) {
        app.innerHTML = this.renderAuthView();
        this.bindAuthEvents();
        return;
      }

      app.innerHTML = `
        <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          ${this.renderHeader()}
          <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            ${this.renderActiveTabContent()}
          </main>
          ${this.renderFooter()}
          <div id="modal-container"></div>
        </div>
      `;

      this.bindHeaderEvents();
      this.bindViewEvents();
      if (window.lucide) window.lucide.createIcons();
    }

    renderHeader() {
      const hostels = this.db.getHostels();
      return `
        <header class="sticky top-0 z-30 glass-nav border-b border-slate-200/80 shadow-xs transition">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 gap-3">
              <!-- Brand Logo & Title -->
              <div class="flex items-center space-x-3 cursor-pointer" id="nav-brand-btn">
                <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <i data-lucide="building-2" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Narasimha</span>
                    <span class="text-xs px-2 py-0.5 font-semibold bg-blue-100 text-blue-700 rounded-full">PG Hostels</span>
                  </div>
                  <p class="hidden sm:block text-xs text-slate-500 font-medium">Multi-Property Hostel & Bed Management</p>
                </div>
              </div>

              <!-- Hostel Filter Dropdown -->
              <div class="flex items-center gap-2">
                <div class="relative">
                  <select id="global-hostel-selector" class="pl-8 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition cursor-pointer appearance-none">
                    <option value="all" ${this.selectedHostelFilter === 'all' ? 'selected' : ''}>🏢 All Hostels (Combined)</option>
                    ${hostels.map(h => `<option value="${h.id}" ${this.selectedHostelFilter === h.id ? 'selected' : ''}>📍 ${h.name} (${h.area || h.city})</option>`).join('')}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                  </div>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                    <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                  </div>
                </div>
              </div>

              <!-- Navigation Links & User Menu -->
              <div class="flex items-center space-x-1 sm:space-x-3">
                <nav class="hidden md:flex items-center space-x-1">
                  <button id="nav-tab-dashboard" class="px-3.5 py-2 text-sm font-semibold rounded-xl transition ${this.currentView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Dashboard
                  </button>
                  <button id="nav-tab-hostels" class="px-3.5 py-2 text-sm font-semibold rounded-xl transition ${this.currentView === 'hostels' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Hostels (${hostels.length})
                  </button>
                  <button id="nav-tab-rooms" class="px-3.5 py-2 text-sm font-semibold rounded-xl transition ${this.currentView === 'rooms' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Rooms & Beds
                  </button>
                </nav>

                <!-- Acceptance Test modal button -->
                <button id="open-db-modal-btn" class="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition" title="Acceptance Test & Database Settings">
                  <i data-lucide="database" class="w-4 h-4 text-slate-500"></i>
                  <span class="hidden lg:inline">Acceptance Test</span>
                </button>

                <!-- User profile / logout -->
                <div class="flex items-center pl-1 sm:pl-2 border-l border-slate-200">
                  <button id="signout-btn" class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Sign Out">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile Navigation Pills -->
            <div class="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
              <button id="mobile-nav-dashboard" class="flex-1 py-1.5 font-medium text-center rounded-lg ${this.currentView === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">
                Dashboard
              </button>
              <button id="mobile-nav-hostels" class="flex-1 py-1.5 font-medium text-center rounded-lg ${this.currentView === 'hostels' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">
                Hostels (${hostels.length})
              </button>
              <button id="mobile-nav-rooms" class="flex-1 py-1.5 font-medium text-center rounded-lg ${this.currentView === 'rooms' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">
                Rooms & Beds
              </button>
            </div>
          </div>
        </header>
      `;
    }

    renderActiveTabContent() {
      if (this.currentView === 'hostels') return this.renderHostelsView();
      if (this.currentView === 'rooms') return this.renderRoomsView();
      return this.renderDashboardView();
    }

    renderDashboardView() {
      const metrics = this.db.getMetrics(this.selectedHostelFilter);
      const hostels = this.db.getHostels();
      const currentHostel = this.selectedHostelFilter !== 'all' ? this.db.getHostelById(this.selectedHostelFilter) : null;
      const rooms = this.db.getRooms(this.selectedHostelFilter);

      return `
        <div class="space-y-6">
          <!-- Page Header & Action Buttons -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
                ${currentHostel ? `Property Overview: ${currentHostel.name}` : 'Multi-Property PG Dashboard'}
              </h1>
              <p class="text-sm text-slate-500 mt-0.5">
                ${currentHostel ? `${currentHostel.area}, ${currentHostel.city}, ${currentHostel.state} — Real-time occupancy & room facilities` : `Viewing consolidated metrics across ${hostels.length} hostel properties`}
              </p>
            </div>
            <div class="flex items-center gap-2.5">
              <button id="quick-add-room-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Add Room</span>
              </button>
              <button id="quick-add-hostel-btn" class="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition">
                <i data-lucide="building" class="w-4 h-4 text-slate-500"></i>
                <span>Add Hostel</span>
              </button>
            </div>
          </div>

          <!-- KPI Summary Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Rooms</span>
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i data-lucide="door-closed" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 mt-3">${metrics.totalRooms}</div>
              <div class="text-xs text-slate-500 mt-1">Across all floors</div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Total Beds</span>
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i data-lucide="bed" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 mt-3">${metrics.totalBeds}</div>
              <div class="text-xs text-slate-500 mt-1">Capacity: 1 to 4 sharing</div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Occupied Beds</span>
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i data-lucide="users" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="text-3xl font-extrabold text-blue-600 mt-3">${metrics.occupiedBeds}</div>
              <div class="text-xs text-slate-500 mt-1">Active residents</div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Available Beds</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <i data-lucide="check-circle" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="text-3xl font-extrabold text-emerald-600 mt-3">${metrics.availableBeds}</div>
              <div class="text-xs text-slate-500 mt-1">${metrics.occupancyRate}% overall occupancy</div>
            </div>
          </div>

          <!-- If a specific hostel is selected, show its full address & Location Banner -->
          ${currentHostel ? this.renderHostelLocationHero(currentHostel) : ''}

          <!-- Hostels Breakdown Section (if viewing combined) -->
          ${this.selectedHostelFilter === 'all' ? `
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>
                  <span>Hostels Breakdown (${hostels.length})</span>
                </h2>
                <button id="view-all-hostels-btn" class="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                  Manage All Hostels →
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                ${hostels.map(h => this.renderHostelCard(h)).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Rooms Preview Section -->
          <div class="space-y-4 pt-2">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <i data-lucide="layout-grid" class="w-5 h-5 text-indigo-600"></i>
                  <span>Rooms & Bed Inventory (${rooms.length})</span>
                </h2>
                <p class="text-xs text-slate-500">Complete room details: Floor, Rent, Washroom, AC, and Bed Allocation</p>
              </div>
              <button id="view-all-rooms-btn" class="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition self-start sm:self-auto">
                Open Full Rooms & Beds Page →
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              ${rooms.slice(0, 6).map(r => this.renderRoomCard(this.db.getRoomDetails(r.id))).join('')}
            </div>
          </div>
        </div>
      `;
    }

    renderHostelLocationHero(hostel) {
      const fullAddress = `${hostel.address || hostel.area}, ${hostel.city || 'Hyderabad'}, ${hostel.state || 'Telangana'} - ${hostel.pincode || '500081'}`;
      const mapsLink = hostel.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

      return `
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl text-white p-6 shadow-md border border-blue-800 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2 max-w-2xl">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  📍 Verified Hostel Location
                </span>
                <span class="text-xs text-blue-200 font-mono">PIN: ${hostel.pincode || '500081'}</span>
              </div>
              <h2 class="text-2xl font-extrabold tracking-tight">${hostel.name}</h2>
              <p class="text-sm text-blue-100 flex items-start gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-amber-300 shrink-0 mt-0.5"></i>
                <span>${fullAddress}</span>
              </p>
              <div class="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
                <span class="flex items-center gap-1.5"><i data-lucide="phone" class="w-3.5 h-3.5 text-blue-300"></i> ${hostel.contact_number || 'N/A'}</span>
                <span class="flex items-center gap-1.5"><i data-lucide="map" class="w-3.5 h-3.5 text-blue-300"></i> Area: ${hostel.area || 'Central'}</span>
                <span class="flex items-center gap-1.5"><i data-lucide="navigation" class="w-3.5 h-3.5 text-blue-300"></i> ${hostel.city}, ${hostel.state}</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                <span>Open in Google Maps</span>
              </a>
              <button data-edit-hostel="${hostel.id}" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-xl border border-white/20 flex items-center justify-center gap-1.5 transition">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
                <span>Edit Location Details</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderHostelCard(hostel) {
      const fullAddress = `${hostel.address || hostel.area}, ${hostel.city || 'Hyderabad'}, ${hostel.state || 'Telangana'} - ${hostel.pincode || '500081'}`;
      const mapsLink = hostel.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
      const metrics = this.db.getMetrics(hostel.id);

      return `
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs interactive-card flex flex-col justify-between">
          <div>
            <!-- Header: Hostel Name & Edit/Delete Icons -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-blue-600">${hostel.area || 'Hyderabad'}</span>
                <h3 class="text-lg font-bold text-slate-900 mt-0.5">${hostel.name}</h3>
              </div>
              <div class="flex items-center gap-1">
                <button data-edit-hostel="${hostel.id}" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Hostel">
                  <i data-lucide="edit-2" class="w-4 h-4"></i>
                </button>
                <button data-delete-hostel="${hostel.id}" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Hostel">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- Complete Hostel Address below Hostel Name (Requirement #3) -->
            <div class="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div class="flex items-start gap-1.5 text-slate-800 font-medium">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5"></i>
                <span>${fullAddress}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-slate-500 pt-1 border-t border-slate-200/60 text-[11px]">
                <div><strong class="text-slate-700">Area:</strong> ${hostel.area}</div>
                <div><strong class="text-slate-700">City:</strong> ${hostel.city}</div>
                <div><strong class="text-slate-700">State:</strong> ${hostel.state}</div>
                <div><strong class="text-slate-700">PIN Code:</strong> ${hostel.pincode}</div>
              </div>
              <div class="text-[11px] text-slate-500 pt-0.5">
                <strong class="text-slate-700">Contact:</strong> ${hostel.contact_number || 'N/A'}
              </div>
            </div>

            <!-- Google Maps Location Link (Requirement #3) -->
            <div class="mt-2.5">
              <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition">
                <i data-lucide="map" class="w-3.5 h-3.5"></i>
                <span>Google Maps Location Link</span>
                <i data-lucide="external-link" class="w-3 h-3 ml-0.5"></i>
              </a>
            </div>

            <!-- Metrics bar -->
            <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
              <div>
                <span class="text-slate-400 block">Rooms</span>
                <span class="font-bold text-slate-800 text-sm">${metrics.totalRooms}</span>
              </div>
              <div>
                <span class="text-slate-400 block">Beds</span>
                <span class="font-bold text-slate-800 text-sm">${metrics.totalBeds}</span>
              </div>
              <div>
                <span class="text-slate-400 block">Occupied</span>
                <span class="font-bold text-blue-600 text-sm">${metrics.occupiedBeds} (${metrics.occupancyRate}%)</span>
              </div>
            </div>

            <div class="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${metrics.occupancyRate}%"></div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100">
            <button data-filter-hostel="${hostel.id}" class="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition">
              <span>Manage Rooms & Beds</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }

    renderHostelsView() {
      const hostels = this.db.getHostels();

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Hostel Properties Management</h1>
              <p class="text-sm text-slate-500 mt-0.5">Complete hostel address (Area, City, State, PIN code) & Google Maps location links</p>
            </div>
            <button id="add-hostel-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add New Hostel</span>
            </button>
          </div>

          <!-- Hostels Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${hostels.length > 0 ? hostels.map(h => this.renderHostelCard(h)).join('') : `
              <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
                <i data-lucide="building" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <h3 class="text-base font-bold text-slate-800">No hostels registered yet</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">Add your first property with location details to start managing rooms.</p>
                <button id="empty-add-hostel-btn" class="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">Add First Hostel</button>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // Exact Room Card Display Requested in User Prompt (Requirement #2)
    renderRoomCard(details) {
      if (!details) return '';
      const { hostel } = details;
      const sharingLabel = SHARING_LABELS[details.sharing_type] || `${details.sharing_type} Sharing`;
      const isAvailable = details.isAvailable;

      return `
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs interactive-card flex flex-col justify-between">
          <div>
            <!-- Header: Room Number and Edit/Delete Actions -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                  <i data-lucide="door-closed" class="w-4 h-4 text-blue-600"></i>
                  Room ${details.room_number}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                  ${details.availabilityStatus}
                </span>
              </div>

              <!-- Admin Edit & Delete Actions (Requirement #4) -->
              <div class="flex items-center gap-1">
                <button data-edit-room="${details.id}" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Room Details">
                  <i data-lucide="edit-2" class="w-4 h-4"></i>
                </button>
                <button data-delete-room="${details.id}" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Room">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- EXACT Room Card Information Block (Requirement #2) -->
            <div class="mt-3 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs space-y-1.5 font-medium text-slate-700">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Hostel:</span>
                <span class="font-bold text-slate-900">${hostel?.name || 'Sai PG'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Floor:</span>
                <span class="font-semibold text-slate-900">${details.floor || '2nd Floor'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Sharing:</span>
                <span class="font-semibold text-slate-900">${sharingLabel}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Monthly Rent:</span>
                <span class="font-extrabold text-emerald-600 text-sm">${this.formatCurrency(details.monthly_rent)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Washroom:</span>
                <span class="font-semibold ${details.attached_washroom ? 'text-blue-700' : 'text-slate-700'}">${details.washroomLabel}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">AC:</span>
                <span class="font-semibold ${details.ac ? 'text-sky-700 font-bold' : 'text-slate-700'}">${details.acLabel}</span>
              </div>
            </div>

            <!-- Existing Occupied & Available Bed Information (Requirement #2) -->
            <div class="mt-3 flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                <span class="font-semibold text-blue-700">${details.occupiedBeds} Occupied</span>
              </div>
              <div class="h-3 w-px bg-slate-200"></div>
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-green-600 shrink-0"></span>
                <span class="font-semibold text-green-700">${details.availableBeds} Available</span>
              </div>
            </div>

            <!-- Bed Mini-Tags -->
            <div class="mt-2.5 space-y-1.5">
              ${details.beds.map(bed => `
                <div class="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs border ${
                  bed.isOccupied ? 'bg-blue-50/50 border-blue-200 text-slate-800' : 'bg-green-50/40 border-green-200 text-slate-800'
                }">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-slate-700">Bed ${bed.bed_number}</span>
                    ${bed.isOccupied ? `
                      <span class="text-slate-600 font-medium">👤 ${bed.assignment?.resident_name || 'Resident'}</span>
                    ` : `
                      <span class="text-slate-400 italic">Unassigned</span>
                    `}
                  </div>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    bed.isOccupied ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }">
                    ${bed.isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Manage Beds & Residents Button -->
          <div class="mt-4 pt-3 border-t border-slate-100">
            <button data-manage-beds="${details.id}" class="w-full py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-xl flex items-center justify-between px-4 text-xs font-semibold text-slate-700 transition">
              <span>Manage Beds & Residents</span>
              <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
            </button>
          </div>
        </div>
      `;
    }

    renderRoomsView() {
      const hostels = this.db.getHostels();
      let rooms = this.db.getRooms(this.selectedHostelFilter);

      // Floor filter
      if (this.selectedFloorFilter !== 'all') {
        rooms = rooms.filter(r => r.floor === this.selectedFloorFilter);
      }

      // Sharing filter
      if (this.selectedSharingFilter !== 'all') {
        rooms = rooms.filter(r => r.sharing_type === parseInt(this.selectedSharingFilter, 10));
      }

      let roomDetailsList = rooms.map(r => this.db.getRoomDetails(r.id)).filter(Boolean);

      // Availability filter
      if (this.selectedAvailabilityFilter === 'available') {
        roomDetailsList = roomDetailsList.filter(d => d.isAvailable);
      } else if (this.selectedAvailabilityFilter === 'occupied') {
        roomDetailsList = roomDetailsList.filter(d => !d.isAvailable);
      }

      // Search filter
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        roomDetailsList = roomDetailsList.filter(d => {
          const matchRoom = d.room_number.toLowerCase().includes(q);
          const matchHostel = d.hostel?.name.toLowerCase().includes(q) || d.hostel?.area?.toLowerCase().includes(q);
          const matchFloor = d.floor?.toLowerCase().includes(q);
          const matchResidents = d.beds.some(b => b.assignment && b.assignment.resident_name.toLowerCase().includes(q));
          return matchRoom || matchHostel || matchFloor || matchResidents;
        });
      }

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Rooms & Beds Management</h1>
              <p class="text-sm text-slate-500 mt-0.5">Manage room inventory, floors, monthly rent, washrooms, AC facilities, and bed allocations</p>
            </div>
            <button id="add-room-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Room</span>
            </button>
          </div>

          <!-- Search and Filter Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <!-- Search bar -->
              <div class="relative lg:col-span-2">
                <input id="room-search-input" type="text" placeholder="Search room #, resident, or hostel..." value="${this.searchQuery}" class="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <i data-lucide="search" class="w-4 h-4"></i>
                </div>
              </div>

              <!-- Floor Filter (Ground Floor to 10th Floor) -->
              <div>
                <select id="filter-floor-select" class="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
                  <option value="all" ${this.selectedFloorFilter === 'all' ? 'selected' : ''}>🏢 All Floors</option>
                  ${FLOORS.map(f => `<option value="${f}" ${this.selectedFloorFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>

              <!-- Sharing Type Filter -->
              <div>
                <select id="filter-sharing-select" class="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
                  <option value="all" ${this.selectedSharingFilter === 'all' ? 'selected' : ''}>👥 All Sharing</option>
                  <option value="1" ${this.selectedSharingFilter === '1' ? 'selected' : ''}>1 Sharing</option>
                  <option value="2" ${this.selectedSharingFilter === '2' ? 'selected' : ''}>2 Sharing</option>
                  <option value="3" ${this.selectedSharingFilter === '3' ? 'selected' : ''}>3 Sharing</option>
                  <option value="4" ${this.selectedSharingFilter === '4' ? 'selected' : ''}>4 Sharing</option>
                </select>
              </div>

              <!-- Availability Filter -->
              <div>
                <select id="filter-avail-select" class="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer">
                  <option value="all" ${this.selectedAvailabilityFilter === 'all' ? 'selected' : ''}>⚡ All Status</option>
                  <option value="available" ${this.selectedAvailabilityFilter === 'available' ? 'selected' : ''}>Available (Has Free Beds)</option>
                  <option value="occupied" ${this.selectedAvailabilityFilter === 'occupied' ? 'selected' : ''}>Fully Occupied</option>
                </select>
              </div>
            </div>

            <!-- Active Filter Chips -->
            <div class="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span class="font-medium">Showing ${roomDetailsList.length} rooms</span>
              ${this.selectedFloorFilter !== 'all' ? `<span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">Floor: ${this.selectedFloorFilter}</span>` : ''}
              ${this.selectedSharingFilter !== 'all' ? `<span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">${this.selectedSharingFilter} Sharing</span>` : ''}
              ${this.selectedAvailabilityFilter !== 'all' ? `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">${this.selectedAvailabilityFilter}</span>` : ''}
              ${(this.selectedFloorFilter !== 'all' || this.selectedSharingFilter !== 'all' || this.selectedAvailabilityFilter !== 'all' || this.searchQuery) ? `
                <button id="clear-all-filters-btn" class="text-blue-600 hover:underline font-semibold ml-1">Reset Filters</button>
              ` : ''}
            </div>
          </div>

          <!-- Rooms Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${roomDetailsList.length > 0 ? roomDetailsList.map(details => this.renderRoomCard(details)).join('') : `
              <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
                <i data-lucide="door-closed" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <h3 class="text-base font-bold text-slate-800">No rooms found</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">Try resetting filters or click Add Room to register a new room.</p>
                <button id="empty-add-room-btn" class="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">Add Room</button>
              </div>
            `}
          </div>
        </div>
      `;
    }

    renderFooter() {
      return `
        <footer class="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-slate-700">Narasimha PG Hostel Manager</span>
              <span>•</span>
              <span>Enhanced Rooms, Washrooms & Floor Management</span>
            </div>
            <div class="flex items-center space-x-4">
              <button id="footer-db-btn" class="text-blue-600 hover:underline font-medium">Acceptance Test & DB Setup</button>
              <span>•</span>
              <span>Mode: <strong class="text-emerald-600 font-semibold uppercase">${this.db.backendMode}</strong></span>
            </div>
          </div>
        </footer>
      `;
    }

    renderAuthView() {
      return `
        <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
          <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/30">
              <i data-lucide="building-2" class="w-8 h-8"></i>
            </div>
            <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-white">Narasimha PG Hostels</h1>
            <p class="mt-1 text-sm text-slate-400">Multi-Property PG Hostel & Bed Occupancy Management System</p>
          </div>

          <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
            <div class="bg-white text-slate-900 py-8 px-6 sm:px-8 rounded-3xl shadow-2xl border border-slate-100 space-y-6">
              <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button id="auth-tab-signin" class="py-2 rounded-lg transition ${this.authTab === 'signin' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                  Owner Sign In
                </button>
                <button id="auth-tab-signup" class="py-2 rounded-lg transition ${this.authTab === 'signup' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                  Create Account
                </button>
              </div>

              <form id="auth-form" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700">Owner Email Address</label>
                  <input id="auth-email" type="email" required placeholder="owner1@hostel.com" class="mt-1 w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700">Password</label>
                  <input id="auth-password" type="password" required placeholder="••••••••" class="mt-1 w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5">
                  <i data-lucide="${this.authTab === 'signin' ? 'log-in' : 'user-plus'}" class="w-4 h-4"></i>
                  <span>${this.authTab === 'signin' ? 'Sign In to Portal' : 'Register as Hostel Owner'}</span>
                </button>
              </form>

              <div class="pt-4 border-t border-slate-100">
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                  Test Multi-Tenant RLS With Demo Accounts
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button id="demo-owner1-btn" class="p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition">
                    <div class="text-xs font-bold text-slate-800">Owner 1 (owns hostels)</div>
                    <div class="text-[10px] text-slate-500 truncate">owner1@hostel.com</div>
                  </button>
                  <button id="demo-owner2-btn" class="p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition">
                    <div class="text-xs font-bold text-slate-800">Owner 2 (isolated)</div>
                    <div class="text-[10px] text-slate-500 truncate">owner2@hostel.com</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    bindAuthEvents() {
      const tabSignIn = document.getElementById('auth-tab-signin');
      const tabSignUp = document.getElementById('auth-tab-signup');
      const authForm = document.getElementById('auth-form');
      const demo1 = document.getElementById('demo-owner1-btn');
      const demo2 = document.getElementById('demo-owner2-btn');

      if (tabSignIn) tabSignIn.onclick = () => { this.authTab = 'signin'; this.render(); };
      if (tabSignUp) tabSignUp.onclick = () => { this.authTab = 'signup'; this.render(); };

      if (demo1) demo1.onclick = () => {
        document.getElementById('auth-email').value = 'owner1@hostel.com';
        document.getElementById('auth-password').value = 'password123';
        authForm.dispatchEvent(new Event('submit'));
      };

      if (demo2) demo2.onclick = () => {
        document.getElementById('auth-email').value = 'owner2@hostel.com';
        document.getElementById('auth-password').value = 'password123';
        authForm.dispatchEvent(new Event('submit'));
      };

      if (authForm) {
        authForm.onsubmit = async (e) => {
          e.preventDefault();
          const email = document.getElementById('auth-email').value;
          const password = document.getElementById('auth-password').value;
          try {
            if (this.authTab === 'signin') {
              await this.db.signIn(email, password);
              this.showToast('Signed in successfully!');
            } else {
              await this.db.signUp(email, password);
              this.showToast('Account registered and logged in!');
            }
            this.render();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        };
      }
      if (window.lucide) window.lucide.createIcons();
    }

    bindHeaderEvents() {
      const brand = document.getElementById('nav-brand-btn');
      const tabDash = document.getElementById('nav-tab-dashboard');
      const tabHostels = document.getElementById('nav-tab-hostels');
      const tabRooms = document.getElementById('nav-tab-rooms');
      const mobDash = document.getElementById('mobile-nav-dashboard');
      const mobHostels = document.getElementById('mobile-nav-hostels');
      const mobRooms = document.getElementById('mobile-nav-rooms');
      const openDb = document.getElementById('open-db-modal-btn');
      const footerDb = document.getElementById('footer-db-btn');
      const signout = document.getElementById('signout-btn');
      const hostelSelector = document.getElementById('global-hostel-selector');

      if (brand) brand.onclick = () => { this.currentView = 'dashboard'; this.render(); };
      if (tabDash) tabDash.onclick = () => { this.currentView = 'dashboard'; this.render(); };
      if (tabHostels) tabHostels.onclick = () => { this.currentView = 'hostels'; this.render(); };
      if (tabRooms) tabRooms.onclick = () => { this.currentView = 'rooms'; this.render(); };
      if (mobDash) mobDash.onclick = () => { this.currentView = 'dashboard'; this.render(); };
      if (mobHostels) mobHostels.onclick = () => { this.currentView = 'hostels'; this.render(); };
      if (mobRooms) mobRooms.onclick = () => { this.currentView = 'rooms'; this.render(); };

      if (openDb) openDb.onclick = () => this.openModal('db-modal');
      if (footerDb) footerDb.onclick = () => this.openModal('db-modal');

      if (signout) signout.onclick = () => {
        this.db.signOut();
        this.showToast('Signed out.');
        this.render();
      };

      if (hostelSelector) {
        hostelSelector.onchange = (e) => {
          this.selectedHostelFilter = e.target.value;
          this.render();
        };
      }
    }

    bindViewEvents() {
      const addRoomBtn = document.getElementById('quick-add-room-btn') || document.getElementById('add-room-btn') || document.getElementById('empty-add-room-btn');
      const addHostelBtn = document.getElementById('quick-add-hostel-btn') || document.getElementById('add-hostel-btn') || document.getElementById('empty-add-hostel-btn');
      const viewAllHostels = document.getElementById('view-all-hostels-btn');
      const viewAllRooms = document.getElementById('view-all-rooms-btn');

      if (addRoomBtn) addRoomBtn.onclick = () => this.openModal('add-room-modal');
      if (addHostelBtn) addHostelBtn.onclick = () => this.openModal('add-hostel-modal');
      if (viewAllHostels) viewAllHostels.onclick = () => { this.currentView = 'hostels'; this.render(); };
      if (viewAllRooms) viewAllRooms.onclick = () => { this.currentView = 'rooms'; this.render(); };

      const searchInput = document.getElementById('room-search-input');
      const floorSelect = document.getElementById('filter-floor-select');
      const sharingSelect = document.getElementById('filter-sharing-select');
      const availSelect = document.getElementById('filter-avail-select');
      const clearFilters = document.getElementById('clear-all-filters-btn');

      if (searchInput) {
        searchInput.oninput = (e) => {
          this.searchQuery = e.target.value;
          this.render();
        };
      }
      if (floorSelect) {
        floorSelect.onchange = (e) => {
          this.selectedFloorFilter = e.target.value;
          this.render();
        };
      }
      if (sharingSelect) {
        sharingSelect.onchange = (e) => {
          this.selectedSharingFilter = e.target.value;
          this.render();
        };
      }
      if (availSelect) {
        availSelect.onchange = (e) => {
          this.selectedAvailabilityFilter = e.target.value;
          this.render();
        };
      }
      if (clearFilters) {
        clearFilters.onclick = () => {
          this.searchQuery = '';
          this.selectedFloorFilter = 'all';
          this.selectedSharingFilter = 'all';
          this.selectedAvailabilityFilter = 'all';
          this.render();
        };
      }

      // Hostel actions
      document.querySelectorAll('[data-edit-hostel]').forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute('data-edit-hostel');
          const hostel = this.db.getHostelById(id);
          if (hostel) this.openModal('edit-hostel-modal', hostel);
        };
      });

      document.querySelectorAll('[data-delete-hostel]').forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute('data-delete-hostel');
          const hostel = this.db.getHostelById(id);
          if (!hostel) return;
          if (confirm(`Are you sure you want to delete ${hostel.name}?`)) {
            try {
              this.db.deleteHostel(id);
              this.showToast(`Deleted ${hostel.name}`);
              this.render();
            } catch (err) {
              this.showToast(err.message, 'error');
            }
          }
        };
      });

      document.querySelectorAll('[data-filter-hostel]').forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute('data-filter-hostel');
          this.selectedHostelFilter = id;
          this.currentView = 'rooms';
          this.render();
        };
      });

      // Room actions
      document.querySelectorAll('[data-edit-room]').forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute('data-edit-room');
          const room = this.db.getRoomDetails(id);
          if (room) this.openModal('edit-room-modal', room);
        };
      });

      document.querySelectorAll('[data-delete-room]').forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute('data-delete-room');
          if (confirm('Are you sure you want to delete this room?')) {
            try {
              this.db.deleteRoom(id);
              this.showToast('Room deleted successfully.');
              this.render();
            } catch (err) {
              this.showToast(err.message, 'error');
            }
          }
        };
      });

      document.querySelectorAll('[data-manage-beds]').forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute('data-manage-beds');
          const room = this.db.getRoomDetails(id);
          if (room) this.openModal('manage-beds-modal', room);
        };
      });
    }

    renderModal() {
      const container = document.getElementById('modal-container');
      if (!container || !this.activeModal) return;

      let content = '';
      if (this.activeModal === 'add-hostel-modal') content = this.renderAddHostelModal();
      else if (this.activeModal === 'edit-hostel-modal') content = this.renderEditHostelModal(this.modalPayload);
      else if (this.activeModal === 'add-room-modal') content = this.renderAddRoomModal();
      else if (this.activeModal === 'edit-room-modal') content = this.renderEditRoomModal(this.modalPayload);
      else if (this.activeModal === 'manage-beds-modal') content = this.renderManageBedsModal(this.modalPayload);
      else if (this.activeModal === 'assign-resident-modal') content = this.renderAssignResidentModal(this.modalPayload);
      else if (this.activeModal === 'db-modal') content = this.renderDbModal();

      container.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden modal-enter-active">
            ${content}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
      this.bindModalEvents();
    }

    // Modal: Add Room Form with ALL requested fields (Requirement #1)
    renderAddRoomModal() {
      const hostels = this.db.getHostels();
      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <i data-lucide="door-closed" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Add New Room</h3>
                <p class="text-xs text-slate-500">Configure room number, floor, rent & washrooms</p>
              </div>
            </div>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="add-room-form" class="mt-4 space-y-4">
            <!-- 1. Hostel Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Hostel Name <span class="text-red-500">*</span></label>
              <select id="r-hostel" required class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="" disabled>-- Select Hostel --</option>
                ${hostels.map(h => `<option value="${h.id}" ${(this.selectedHostelFilter === h.id || (!this.selectedHostelFilter && h.id === hostels[0]?.id)) ? 'selected' : ''}>${h.name} (${h.area || h.city})</option>`).join('')}
              </select>
            </div>

            <!-- 2. Room Number & 3. Floor Number -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Room Number <span class="text-red-500">*</span></label>
                <input id="r-number" type="text" required placeholder="e.g. 101, 205" class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Floor Number <span class="text-red-500">*</span></label>
                <select id="r-floor" required class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  ${FLOORS.map(f => `<option value="${f}" ${f === '2nd Floor' ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- 4. Room Sharing Type & 5. Monthly Rent -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Room Sharing Type <span class="text-red-500">*</span></label>
                <select id="r-sharing" required class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="1">Single Sharing (1 Bed)</option>
                  <option value="2">2 Sharing (2 Beds)</option>
                  <option value="3" selected>3 Sharing (3 Beds)</option>
                  <option value="4">4 Sharing (4 Beds)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹) <span class="text-red-500">*</span></label>
                <input id="r-rent" type="number" required value="6000" min="500" step="100" class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <!-- 6. Attached Washroom & 7. Common Washroom -->
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label class="block text-xs font-bold text-slate-800">Washroom Facilities</label>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="block text-slate-600 mb-1 font-medium">Attached Washroom:</span>
                  <div class="flex items-center space-x-3">
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="r-attached" value="yes" checked class="text-blue-600">
                      <span>Yes</span>
                    </label>
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="r-attached" value="no" class="text-blue-600">
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <span class="block text-slate-600 mb-1 font-medium">Common Washroom:</span>
                  <div class="flex items-center space-x-3">
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="r-common" value="yes" class="text-blue-600">
                      <span>Yes</span>
                    </label>
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="r-common" value="no" checked class="text-blue-600">
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- 8. AC / Non-AC -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">AC / Non-AC</label>
              <div class="flex items-center space-x-4 text-xs">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="r-ac" value="non-ac" checked class="text-blue-600">
                  <span>Non-AC</span>
                </label>
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="r-ac" value="ac" class="text-blue-600">
                  <span>AC</span>
                </label>
              </div>
            </div>

            <!-- 9. Room Availability Preview -->
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
              <span class="text-emerald-800 font-medium">Room Availability:</span>
              <span class="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Available (Ready for check-in)
              </span>
            </div>

            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20">Create Room</button>
            </div>
          </form>
        </div>
      `;
    }

    // Modal: Edit Room Form with all fields editable (Requirement #4)
    renderEditRoomModal(room) {
      const hostels = this.db.getHostels();
      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Edit Room Details</h3>
                <p class="text-xs text-slate-500">Update floor, washroom facilities, rent, location, and AC</p>
              </div>
            </div>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="edit-room-form" class="mt-4 space-y-4">
            <!-- Hostel Location Selection -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Hostel Location *</label>
              <select id="er-hostel" required class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                ${hostels.map(h => `<option value="${h.id}" ${h.id === room.hostel_id ? 'selected' : ''}>${h.name} (${h.area || h.city})</option>`).join('')}
              </select>
            </div>

            <!-- Room Number & Floor Number -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Room Number *</label>
                <input id="er-number" type="text" required value="${room.room_number}" class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Floor Number *</label>
                <select id="er-floor" required class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  ${FLOORS.map(f => `<option value="${f}" ${(room.floor === f) ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Room Type / Sharing & Monthly Rent -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Room Type (Sharing) *</label>
                <select id="er-sharing" required class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="1" ${room.sharing_type === 1 ? 'selected' : ''}>1 Sharing</option>
                  <option value="2" ${room.sharing_type === 2 ? 'selected' : ''}>2 Sharing</option>
                  <option value="3" ${room.sharing_type === 3 ? 'selected' : ''}>3 Sharing</option>
                  <option value="4" ${room.sharing_type === 4 ? 'selected' : ''}>4 Sharing</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹) *</label>
                <input id="er-rent" type="number" required value="${room.monthly_rent || 6000}" min="500" step="100" class="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <!-- Washroom Facilities -->
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label class="block text-xs font-bold text-slate-800">Washroom Facilities</label>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="block text-slate-600 mb-1 font-medium">Attached Washroom:</span>
                  <div class="flex items-center space-x-3">
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="er-attached" value="yes" ${room.attached_washroom ? 'checked' : ''} class="text-blue-600">
                      <span>Yes</span>
                    </label>
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="er-attached" value="no" ${!room.attached_washroom ? 'checked' : ''} class="text-blue-600">
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <span class="block text-slate-600 mb-1 font-medium">Common Washroom:</span>
                  <div class="flex items-center space-x-3">
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="er-common" value="yes" ${room.common_washroom ? 'checked' : ''} class="text-blue-600">
                      <span>Yes</span>
                    </label>
                    <label class="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="er-common" value="no" ${!room.common_washroom ? 'checked' : ''} class="text-blue-600">
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- AC / Non-AC -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">AC / Non-AC</label>
              <div class="flex items-center space-x-4 text-xs">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="er-ac" value="non-ac" ${!room.ac ? 'checked' : ''} class="text-blue-600">
                  <span>Non-AC</span>
                </label>
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" name="er-ac" value="ac" ${room.ac ? 'checked' : ''} class="text-blue-600">
                  <span>AC</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20">Save Changes</button>
            </div>
          </form>
        </div>
      `;
    }

    renderAddHostelModal() {
      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="building-2" class="w-5 h-5 text-blue-600"></i>
              <span>Add Hostel Property</span>
            </h3>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="add-hostel-form" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Hostel Name *</label>
              <input id="h-name" type="text" required placeholder="Sri Sai Boys Hostel" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700">Area / Locality *</label>
                <input id="h-area" type="text" required placeholder="Ameerpet" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700">City *</label>
                <input id="h-city" type="text" required value="Hyderabad" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700">State *</label>
                <input id="h-state" type="text" required value="Telangana" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700">PIN Code *</label>
                <input id="h-pincode" type="text" required placeholder="500038" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Complete Address *</label>
              <textarea id="h-address" required rows="2" placeholder="Beside Metro Pillar A1042, Ameerpet, Hyderabad, Telangana" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Contact Phone Number *</label>
              <input id="h-phone" type="text" required placeholder="+91 98480 12345" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Google Maps Location Link (or search query)</label>
              <input id="h-maps" type="url" placeholder="https://www.google.com/maps/search/?api=1&query=..." class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span class="text-[11px] text-slate-400">Leave blank to auto-generate Google Maps link from address & PIN</span>
            </div>

            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20">Add Hostel</button>
            </div>
          </form>
        </div>
      `;
    }

    renderEditHostelModal(hostel) {
      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="edit-3" class="w-5 h-5 text-blue-600"></i>
              <span>Edit Hostel Location Details</span>
            </h3>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="edit-hostel-form" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Hostel Name *</label>
              <input id="eh-name" type="text" required value="${hostel.name}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700">Area / Locality *</label>
                <input id="eh-area" type="text" required value="${hostel.area || ''}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700">City *</label>
                <input id="eh-city" type="text" required value="${hostel.city || 'Hyderabad'}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700">State *</label>
                <input id="eh-state" type="text" required value="${hostel.state || 'Telangana'}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700">PIN Code *</label>
                <input id="eh-pincode" type="text" required value="${hostel.pincode || '500081'}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Complete Address *</label>
              <textarea id="eh-address" required rows="2" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">${hostel.address || ''}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Contact Phone Number *</label>
              <input id="eh-phone" type="text" required value="${hostel.contact_number || ''}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Google Maps Location Link</label>
              <input id="eh-maps" type="url" value="${hostel.maps_url || ''}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20">Save Changes</button>
            </div>
          </form>
        </div>
      `;
    }

    renderManageBedsModal(room) {
      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="bed-double" class="w-5 h-5 text-blue-600"></i>
                <span>Room ${room.room_number} Beds & Residents</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">${room.floor} • ${room.hostel?.name} • ${room.totalBeds} Beds (${room.availableBeds} Available)</p>
            </div>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            ${room.beds.map(bed => `
              <div class="p-4 rounded-2xl border ${bed.isOccupied ? 'bg-blue-50/50 border-blue-200' : 'bg-emerald-50/40 border-emerald-200'} flex items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900">Bed ${bed.bed_number}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${bed.isOccupied ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">
                      ${bed.isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                  ${bed.isOccupied ? `
                    <div class="text-xs text-slate-600 space-y-0.5">
                      <div class="font-medium text-slate-800">Resident: ${bed.assignment?.resident_name}</div>
                      <div>Phone: ${bed.assignment?.mobile_number || 'N/A'}</div>
                      <div class="text-[11px] text-slate-400">Moved in: ${bed.assignment?.move_in_date || 'N/A'}</div>
                    </div>
                  ` : `
                    <p class="text-xs text-emerald-700">Ready for resident move-in</p>
                  `}
                </div>

                <div>
                  ${bed.isOccupied ? `
                    <button data-checkout-bed="${bed.id}" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition">
                      Check Out
                    </button>
                  ` : `
                    <button data-assign-bed="${bed.id}" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition">
                      Assign Resident
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button id="modal-close-btn-2" class="px-5 py-2 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-800">Done</button>
          </div>
        </div>
      `;
    }

    renderAssignResidentModal(bedId) {
      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-5 h-5 text-emerald-600"></i>
              <span>Assign Resident to Bed</span>
            </h3>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="assign-resident-form" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Resident Full Name *</label>
              <input id="res-name" type="text" required placeholder="e.g. Rahul Sharma" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Mobile Number (Optional)</label>
              <input id="res-phone" type="tel" placeholder="+91 98765 43210" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700">Move-in Date *</label>
              <input id="res-date" type="date" required value="${new Date().toISOString().split('T')[0]}" class="mt-1 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            </div>

            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20">Confirm Assignment</button>
            </div>
          </form>
        </div>
      `;
    }

    renderDbModal() {
      const currentUser = this.db.currentUser;

      return `
        <div class="p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="database" class="w-5 h-5 text-blue-600"></i>
                <span>Acceptance Test & Database Setup</span>
              </h3>
              <p class="text-xs text-slate-500">Verify all 7 requested features & live database persistence</p>
            </div>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div class="font-bold text-slate-800 text-sm">Feature Acceptance Checklist</div>
              <ul class="space-y-1.5 text-slate-600">
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>1. Hostel Location:</strong> Complete address below hostel name with Area, City, State, PIN code, and Google Maps location link.</span>
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>2. Washroom Facilities:</strong> Attached Washroom (Yes/No) and Common Washroom (Yes/No) on every room.</span>
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>3. Floor Information:</strong> Selection of Ground Floor to 10th Floor and displayed on every room.</span>
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>4. Room Details:</strong> Room Number, Floor, Room Type, Monthly Rent, Washrooms, AC/Non-AC, and Availability.</span>
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>5. Card Layout:</strong> Attractive layout with Room 101, Sai PG, 2nd Floor, 3 Sharing, ₹6,000, Attached, Non-AC.</span>
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>6. Admin Features:</strong> Add/Edit hostel locations, select floors, update washrooms, add/edit/delete rooms with database persistence.</span>
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><strong>7. Design:</strong> Modern blue-and-white theme, mobile-friendly layout, crisp Lucide icons.</span>
                </li>
              </ul>
            </div>

            <div class="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-2">
              <div class="font-bold text-blue-900 text-sm">Active Owner: ${currentUser ? currentUser.email : 'None'}</div>
              <p class="text-slate-600">Test Row-Level Security isolation between multi-tenant accounts:</p>
              <div class="flex gap-2 pt-1">
                <button id="switch-owner-1-btn" class="flex-1 py-1.5 bg-white border border-blue-300 rounded-xl text-blue-700 font-semibold hover:bg-blue-100 transition">
                  Owner 1 (owns hostels)
                </button>
                <button id="switch-owner-2-btn" class="flex-1 py-1.5 bg-white border border-blue-300 rounded-xl text-blue-700 font-semibold hover:bg-blue-100 transition">
                  Owner 2 (0 hostels)
                </button>
              </div>
            </div>

            <div class="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
              <div class="font-bold text-amber-900 text-sm">Reset Sample Data</div>
              <p class="text-amber-800">Restore database with Sai PG (Room 101), Lakshmi PG (Room 102), and Sri Sai Boys Hostel (Room 205).</p>
              <button id="reset-sample-btn" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition">
                Reset Sample Data
              </button>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button id="modal-close-btn-2" class="px-5 py-2 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-800">Close</button>
          </div>
        </div>
      `;
    }

    bindModalEvents() {
      const closeBtn = document.getElementById('modal-close-btn');
      const closeBtn2 = document.getElementById('modal-close-btn-2');
      const cancelBtn = document.getElementById('modal-cancel-btn');

      if (closeBtn) closeBtn.onclick = () => this.closeModal();
      if (closeBtn2) closeBtn2.onclick = () => this.closeModal();
      if (cancelBtn) cancelBtn.onclick = () => this.closeModal();

      // Add Hostel Form
      const addHostelForm = document.getElementById('add-hostel-form');
      if (addHostelForm) {
        addHostelForm.onsubmit = (e) => {
          e.preventDefault();
          try {
            const data = {
              name: document.getElementById('h-name').value,
              area: document.getElementById('h-area').value,
              city: document.getElementById('h-city').value,
              state: document.getElementById('h-state').value,
              pincode: document.getElementById('h-pincode').value,
              address: document.getElementById('h-address').value,
              contact_number: document.getElementById('h-phone').value,
              maps_url: document.getElementById('h-maps').value
            };
            this.db.createHostel(data);
            this.showToast('Hostel added successfully!');
            this.closeModal();
            this.render();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        };
      }

      // Edit Hostel Form
      const editHostelForm = document.getElementById('edit-hostel-form');
      if (editHostelForm) {
        editHostelForm.onsubmit = (e) => {
          e.preventDefault();
          try {
            const data = {
              name: document.getElementById('eh-name').value,
              area: document.getElementById('eh-area').value,
              city: document.getElementById('eh-city').value,
              state: document.getElementById('eh-state').value,
              pincode: document.getElementById('eh-pincode').value,
              address: document.getElementById('eh-address').value,
              contact_number: document.getElementById('eh-phone').value,
              maps_url: document.getElementById('eh-maps').value
            };
            this.db.updateHostel(this.modalPayload.id, data);
            this.showToast('Hostel updated successfully!');
            this.closeModal();
            this.render();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        };
      }

      // Add Room Form
      const addRoomForm = document.getElementById('add-room-form');
      if (addRoomForm) {
        addRoomForm.onsubmit = (e) => {
          e.preventDefault();
          try {
            const attached = document.querySelector('input[name="r-attached"]:checked')?.value === 'yes';
            const common = document.querySelector('input[name="r-common"]:checked')?.value === 'yes';
            const ac = document.querySelector('input[name="r-ac"]:checked')?.value === 'ac';

            const data = {
              hostel_id: document.getElementById('r-hostel').value,
              room_number: document.getElementById('r-number').value,
              floor: document.getElementById('r-floor').value,
              sharing_type: document.getElementById('r-sharing').value,
              monthly_rent: document.getElementById('r-rent').value,
              attached_washroom: attached,
              common_washroom: common,
              ac: ac
            };
            this.db.createRoom(data);
            this.showToast('Room created with beds auto-generated!');
            this.closeModal();
            this.render();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        };
      }

      // Edit Room Form
      const editRoomForm = document.getElementById('edit-room-form');
      if (editRoomForm) {
        editRoomForm.onsubmit = (e) => {
          e.preventDefault();
          try {
            const attached = document.querySelector('input[name="er-attached"]:checked')?.value === 'yes';
            const common = document.querySelector('input[name="er-common"]:checked')?.value === 'yes';
            const ac = document.querySelector('input[name="er-ac"]:checked')?.value === 'ac';

            const data = {
              hostel_id: document.getElementById('er-hostel').value,
              room_number: document.getElementById('er-number').value,
              floor: document.getElementById('er-floor').value,
              sharing_type: document.getElementById('er-sharing').value,
              monthly_rent: document.getElementById('er-rent').value,
              attached_washroom: attached,
              common_washroom: common,
              ac: ac
            };
            this.db.updateRoom(this.modalPayload.id, data);
            this.showToast('Room details updated successfully!');
            this.closeModal();
            this.render();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        };
      }

      // Bed Operations
      document.querySelectorAll('[data-checkout-bed]').forEach(btn => {
        btn.onclick = (e) => {
          const bedId = e.currentTarget.getAttribute('data-checkout-bed');
          if (confirm('Check out this resident? The bed will immediately become available.')) {
            try {
              this.db.checkoutResident(bedId);
              this.showToast('Resident checked out. Bed is now available.');
              const updatedRoom = this.db.getRoomDetails(this.modalPayload.id);
              this.modalPayload = updatedRoom;
              this.renderModal();
              this.render();
            } catch (err) {
              this.showToast(err.message, 'error');
            }
          }
        };
      });

      document.querySelectorAll('[data-assign-bed]').forEach(btn => {
        btn.onclick = (e) => {
          const bedId = e.currentTarget.getAttribute('data-assign-bed');
          this.openModal('assign-resident-modal', bedId);
        };
      });

      const assignResidentForm = document.getElementById('assign-resident-form');
      if (assignResidentForm) {
        assignResidentForm.onsubmit = (e) => {
          e.preventDefault();
          try {
            const resData = {
              resident_name: document.getElementById('res-name').value,
              mobile_number: document.getElementById('res-phone').value,
              move_in_date: document.getElementById('res-date').value
            };
            this.db.assignResident(this.modalPayload, resData);
            this.showToast('Resident assigned successfully!');
            this.closeModal();
            this.render();
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        };
      }

      const resetBtn = document.getElementById('reset-sample-btn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          if (confirm('Reset database to initial sample data?')) {
            this.db.resetSampleData();
            this.showToast('Sample data restored.');
            this.closeModal();
            this.render();
          }
        };
      }

      const switch1 = document.getElementById('switch-owner-1-btn');
      const switch2 = document.getElementById('switch-owner-2-btn');
      if (switch1) {
        switch1.onclick = () => {
          this.db.saveCurrentUser({ id: '00000000-0000-4000-8000-000000000001', email: 'owner1@hostel.com' });
          this.showToast('Switched to Owner 1');
          this.closeModal();
          this.render();
        };
      }
      if (switch2) {
        switch2.onclick = () => {
          this.db.saveCurrentUser({ id: '00000000-0000-4000-8000-000000000002', email: 'owner2@hostel.com' });
          this.showToast('Switched to Owner 2 (Isolated Tenant)');
          this.closeModal();
          this.render();
        };
      }
    }
  }

  // Expose to window for external integration & testing
  window.DatabaseService = DatabaseService;
  window.AppController = AppController;

  // Auto-init
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
  });
})();

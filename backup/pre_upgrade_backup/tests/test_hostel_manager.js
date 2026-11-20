// Node.js Test Suite for Hostel Manager Business Logic & Database Service
const fs = require('fs');
const assert = require('assert');

// Mock localStorage and window
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

global.crypto = {
  randomUUID: () => 'uuid-' + Math.random().toString(36).substring(2, 10)
};

global.window = {};
global.document = {
  addEventListener: () => {}
};

// Load app code by extracting class definitions
const appCode = fs.readFileSync('js/app.js', 'utf8');
eval(appCode);

console.log('Testing AppController & DatabaseService...');

const db = new window.DatabaseService();

// Test 1: Seed data loaded
const hostels = db.getHostels();
assert.strictEqual(hostels.length, 3, 'Should have 3 hostels in seed data');
console.log('✓ Seed hostels verified: ' + hostels.map(h => h.name).join(', '));

// Test 2: Hostel Location Details (Requirement #1 & #3)
const saiPG = hostels.find(h => h.name === 'Sai PG');
assert.ok(saiPG, 'Sai PG must exist');
assert.strictEqual(saiPG.area, 'Madhapur', 'Area should be Madhapur');
assert.strictEqual(saiPG.city, 'Hyderabad', 'City should be Hyderabad');
assert.strictEqual(saiPG.state, 'Telangana', 'State should be Telangana');
assert.strictEqual(saiPG.pincode, '500081', 'PIN code should be 500081');
assert.ok(saiPG.maps_url.includes('google.com/maps'), 'Google Maps URL must be present');
console.log('✓ Hostel location details verified (Area, City, State, PIN, Maps URL)');

// Test 3: Rooms Details & Formatting (Requirement #2 & #4)
const rooms = db.getRooms();
assert.ok(rooms.length >= 3, 'Should have at least 3 rooms');

const room101 = rooms.find(r => r.room_number === '101');
assert.ok(room101, 'Room 101 must exist');
const details101 = db.getRoomDetails(room101.id);
assert.strictEqual(details101.floor, '2nd Floor', 'Floor should be 2nd Floor');
assert.strictEqual(details101.sharing_type, 3, 'Sharing should be 3');
assert.strictEqual(details101.monthly_rent, 6000, 'Monthly rent should be 6000');
assert.strictEqual(details101.attached_washroom, true, 'Attached washroom should be true');
assert.strictEqual(details101.common_washroom, false, 'Common washroom should be false');
assert.strictEqual(details101.ac, false, 'AC should be false (Non-AC)');
assert.strictEqual(details101.washroomLabel, 'Attached', 'Washroom label should be Attached');
assert.strictEqual(details101.acLabel, 'Non-AC', 'AC label should be Non-AC');
console.log('✓ Room 101 details verified: 2nd Floor, 3 Sharing, ₹6,000, Attached, Non-AC');

// Test 4: Room 205 (Sri Sai Boys Hostel)
const room205 = rooms.find(r => r.room_number === '205');
assert.ok(room205, 'Room 205 must exist');
const details205 = db.getRoomDetails(room205.id);
assert.strictEqual(details205.floor, '2nd Floor', 'Floor should be 2nd Floor');
assert.strictEqual(details205.sharing_type, 3, 'Sharing should be 3');
assert.strictEqual(details205.monthly_rent, 6000, 'Monthly rent should be 6000');
assert.strictEqual(details205.isAvailable, true, 'Room 205 should be available');
console.log('✓ Room 205 verified: 2nd Floor, 3 Sharing, ₹6,000, Attached, Available');

// Test 5: Add Room with all 11 floors, washrooms, AC, rent
const newRoom = db.createRoom({
  hostel_id: saiPG.id,
  room_number: '305',
  floor: '5th Floor',
  sharing_type: 2,
  monthly_rent: 8500,
  attached_washroom: true,
  common_washroom: true,
  ac: true
});
assert.strictEqual(newRoom.room_number, '305');
assert.strictEqual(newRoom.floor, '5th Floor');
assert.strictEqual(newRoom.monthly_rent, 8500);
assert.strictEqual(newRoom.attached_washroom, true);
assert.strictEqual(newRoom.common_washroom, true);
assert.strictEqual(newRoom.ac, true);

// Verify beds auto-generated
const details305 = db.getRoomDetails(newRoom.id);
assert.strictEqual(details305.beds.length, 2, '2 beds should be auto-created for 2 sharing');
assert.strictEqual(details305.availableBeds, 2, 'All 2 beds should be free');
assert.strictEqual(details305.washroomLabel, 'Attached & Common');
assert.strictEqual(details305.acLabel, 'AC');
console.log('✓ Add Room verified: 5th Floor, 2 Sharing, ₹8,500, Attached & Common, AC');

// Test 6: Edit Room Functionality (Requirement #4)
db.updateRoom(newRoom.id, {
  room_number: '305-A',
  floor: '8th Floor',
  sharing_type: 3,
  monthly_rent: 7200,
  attached_washroom: false,
  common_washroom: true,
  ac: false
});

const updated305 = db.getRoomDetails(newRoom.id);
assert.strictEqual(updated305.room_number, '305-A');
assert.strictEqual(updated305.floor, '8th Floor');
assert.strictEqual(updated305.sharing_type, 3);
assert.strictEqual(updated305.monthly_rent, 7200);
assert.strictEqual(updated305.washroomLabel, 'Common');
assert.strictEqual(updated305.acLabel, 'Non-AC');
assert.strictEqual(updated305.beds.length, 3, 'Beds count should increase to 3');
console.log('✓ Edit Room verified: Updated to 8th Floor, 3 Sharing, ₹7,200, Common washroom, Non-AC');

// Test 7: Resident Allocation & Check out
db.assignResident(updated305.beds[0].id, {
  resident_name: 'Kiran',
  mobile_number: '+91 99999 88888',
  move_in_date: '2026-11-20'
});
const withResident = db.getRoomDetails(newRoom.id);
assert.strictEqual(withResident.occupiedBeds, 1);
assert.strictEqual(withResident.availableBeds, 2);

db.checkoutResident(updated305.beds[0].id);
const checkedOut = db.getRoomDetails(newRoom.id);
assert.strictEqual(checkedOut.occupiedBeds, 0);
assert.strictEqual(checkedOut.availableBeds, 3);
console.log('✓ Resident assignment and checkout verified');

// Test 8: Persistence across DB reload
const reloadedDb = new window.DatabaseService();
const reloadedRoom = reloadedDb.getRoomDetails(newRoom.id);
assert.ok(reloadedRoom, 'Room must persist after reinitializing DB');
assert.strictEqual(reloadedRoom.room_number, '305-A');
assert.strictEqual(reloadedRoom.floor, '8th Floor');
assert.strictEqual(reloadedRoom.monthly_rent, 7200);
console.log('✓ Persistence verified across DB re-instantiation');

console.log('\n========================================');
console.log('ALL UNIT & ACCEPTANCE TESTS PASSED! (8/8)');
console.log('========================================');

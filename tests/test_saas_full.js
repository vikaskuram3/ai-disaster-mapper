/**
 * Comprehensive Enterprise Test Suite for Narasimha PG Hostel Manager SaaS v3.0
 * Verifies all 16 major system capabilities and architectural invariants.
 */

const fs = require('fs');
const assert = require('assert');

// 1. Mock Browser Environment
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.crypto = {
  randomUUID: () => 'uuid-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36)
};

global.window = {};
global.document = {
  addEventListener: () => {},
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
  getElementById: () => null,
  body: { appendChild: () => {} }
};
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };

// 2. Load DB and App Layers
const dbCode = fs.readFileSync('js/db.js', 'utf8');
eval(dbCode);
const appCode = fs.readFileSync('js/app.js', 'utf8');
eval(appCode);

console.log('================================================================');
console.log('STARTING FULL SAAS ACCEPTANCE TEST SUITE (16 MODULES)');
console.log('================================================================\n');

let passedTests = 0;
const totalTests = 16;

function runTest(name, fn) {
  try {
    fn();
    passedTests++;
    console.log(`[PASS] Test ${passedTests}/${totalTests}: ${name}`);
  } catch (err) {
    console.error(`[FAIL] Test ${passedTests + 1}/${totalTests}: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// Instantiate Database
const db = new window.DatabaseService();

// TEST 1: User Authentication & Role Isolation
runTest('Multi-Role Authentication & Access Isolation', () => {
  const owner = db.state.profiles.find(p => p.role === 'owner' && p.email === 'owner1@hostel.com');
  const student = db.state.profiles.find(p => p.role === 'student' && p.email === 'ravi@gmail.com');
  assert.ok(owner, 'Owner profile must exist');
  assert.ok(student, 'Student profile must exist');
  assert.strictEqual(owner.role, 'owner');
  assert.strictEqual(student.role, 'student');

  // Verify owner isolation: owner 1 only sees their hostels
  db.saveCurrentUser(owner);
  const ownerHostels = db.getHostels();
  assert.strictEqual(ownerHostels.length, 3, 'Owner 1 should own 3 hostels');
  ownerHostels.forEach(h => assert.strictEqual(h.owner_id, owner.id));
});

// TEST 2: Hostel Management (Add, Edit, Complete Address, Google Maps)
runTest('Hostel Management CRUD, Addresses & Google Maps Links', () => {
  // Test create hostel
  const newHostel = db.createHostel({
    name: 'Balaji Executive Boys PG',
    type: 'Boys',
    area: 'Kondapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500084',
    address: 'Near RTO Office, Kondapur, Hyderabad, Telangana',
    contact_number: '+91 99887 76655',
    total_floors: 4
  });

  assert.ok(newHostel.id);
  assert.strictEqual(newHostel.name, 'Balaji Executive Boys PG');
  assert.strictEqual(newHostel.area, 'Kondapur');
  assert.strictEqual(newHostel.city, 'Hyderabad');
  assert.strictEqual(newHostel.state, 'Telangana');
  assert.strictEqual(newHostel.pincode, '500084');
  assert.ok(newHostel.maps_url.includes('google.com/maps'));

  // Test update hostel
  db.updateHostel(newHostel.id, {
    contact_number: '+91 99887 00000',
    address: 'Opposite Botanical Garden, Kondapur, Hyderabad, Telangana'
  });
  const updated = db.getHostelById(newHostel.id);
  assert.strictEqual(updated.contact_number, '+91 99887 00000');
  assert.strictEqual(updated.address, 'Opposite Botanical Garden, Kondapur, Hyderabad, Telangana');
});

// TEST 3: Delete Hostel Resident Safety Guard
runTest('Delete Hostel Safety Confirmation (Blocks deletion when active students reside)', () => {
  const saiPG = db.state.hostels.find(h => h.name === 'Sai PG');
  assert.ok(saiPG);

  // Sai PG has active students (Ravi, Suresh). Deletion must throw error!
  assert.throws(() => {
    db.deleteHostel(saiPG.id);
  }, /Cannot delete hostel: \d+ active resident student/);
});

// TEST 4: Floor Management (11 Standard Floors + Custom Floor)
runTest('Floor Management: 11 Standard Floors & Custom Floors', () => {
  const saiPG = db.state.hostels.find(h => h.name === 'Sai PG');
  const floors = db.getFloors(saiPG.id);

  assert.ok(floors.includes('Ground Floor'));
  assert.ok(floors.includes('1st Floor'));
  assert.ok(floors.includes('2nd Floor'));
  assert.ok(floors.includes('3rd Floor'));
  assert.ok(floors.includes('4th Floor'));
  assert.ok(floors.includes('5th Floor'));
  assert.ok(floors.includes('6th Floor'));
  assert.ok(floors.includes('7th Floor'));
  assert.ok(floors.includes('8th Floor'));
  assert.ok(floors.includes('9th Floor'));
  assert.ok(floors.includes('10th Floor'));
  assert.strictEqual(floors.length >= 11, true, 'Must have at least 11 floors');

  // Add custom floor
  db.addCustomFloor(saiPG.id, 'Penthouse Floor');
  const updatedFloors = db.getFloors(saiPG.id);
  assert.ok(updatedFloors.includes('Penthouse Floor'), 'Custom floor must be registered');
});

// TEST 5: Sharing-Wise Pricing Configuration
runTest('Sharing-Wise Pricing Configuration per Hostel', () => {
  const saiPG = db.state.hostels.find(h => h.name === 'Sai PG');
  const pricing = db.getPricing(saiPG.id);

  assert.strictEqual(pricing[1], 10000, 'Single Sharing default: 10,000');
  assert.strictEqual(pricing[2], 7000, '2 Sharing default: 7,000');
  assert.strictEqual(pricing[3], 6000, '3 Sharing default: 6,000');
  assert.strictEqual(pricing[4], 5000, '4 Sharing default: 5,000');
  assert.strictEqual(pricing[5], 4500, '5 Sharing default: 4,500');

  // Custom pricing update for Sai PG
  db.updatePricing(saiPG.id, {
    1: 12000,
    2: 8500,
    3: 6500,
    4: 5500,
    5: 5000
  });

  const customPricing = db.getPricing(saiPG.id);
  assert.strictEqual(customPricing[1], 12000);
  assert.strictEqual(customPricing[2], 8500);
  assert.strictEqual(customPricing[3], 6500);
});

// TEST 6: Critical Invariant: Updating Pricing Never Changes Existing Students' Agreed Rent
runTest('CRITICAL INVARIANT: Updating Room Prices Does NOT Alter Existing Students Agreed Rent', () => {
  const ravi = db.state.students.find(s => s.full_name === 'Ravi Kumar');
  assert.ok(ravi);
  const raviAgreedRentBefore = ravi.agreed_monthly_rent;
  assert.strictEqual(raviAgreedRentBefore, 6000, 'Ravi joined with agreed rent of ₹6,000');

  // Owner drastically increases 3-sharing price from ₹6,000 to ₹9,500
  db.updatePricing(ravi.hostel_id, {
    3: 9500
  });

  // Verify Ravi's agreed rent is strictly unchanged
  const raviAfter = db.state.students.find(s => s.id === ravi.id);
  assert.strictEqual(raviAfter.agreed_monthly_rent, 6000, 'CRITICAL: Ravi agreed monthly rent MUST remain ₹6,000!');
  assert.strictEqual(raviAfter.agreed_monthly_rent, raviAgreedRentBefore);
});

// TEST 7: Room Details & Exact User Format Verification
runTest('Room Details & Exact Formatting (Room 205 in Sri Sai Boys Hostel)', () => {
  const room205 = db.state.rooms.find(r => r.room_number === '205');
  assert.ok(room205, 'Room 205 must exist in seed data');

  const details = db.getRoomDetails(room205.id);
  assert.strictEqual(details.room_number, '205');
  assert.strictEqual(details.floor, '2nd Floor');
  assert.strictEqual(details.sharing_type, 3);
  assert.strictEqual(details.monthly_rent, 6000);
  assert.strictEqual(details.attached_washroom, true);
  assert.strictEqual(details.common_washroom, false);
  assert.strictEqual(details.ac, false);
  assert.strictEqual(details.occupiedBeds, 2, '2 beds occupied by Mahesh and Praveen');
  assert.strictEqual(details.availableBeds, 1, '1 bed vacant');
  assert.strictEqual(details.washroomLabel, 'Attached');
  assert.strictEqual(details.acLabel, 'Non-AC');
});

// TEST 8: Room Capacity Adjustment & Safety Guards
runTest('Room Capacity Validation & Bed Reduction Safety Guard', () => {
  const room205 = db.state.rooms.find(r => r.room_number === '205');

  // Room 205 has beds 1 & 2 occupied. Reducing sharing capacity to 1 sharing must fail!
  assert.throws(() => {
    db.updateRoom(room205.id, { sharing_type: 1 });
  }, /Cannot reduce room capacity to 1/);

  // Expanding capacity to 4 sharing should succeed and add bed 4
  db.updateRoom(room205.id, { sharing_type: 4 });
  const updatedDetails = db.getRoomDetails(room205.id);
  assert.strictEqual(updatedDetails.totalBeds, 4);
  assert.strictEqual(updatedDetails.occupiedBeds, 2);
  assert.strictEqual(updatedDetails.availableBeds, 2);
});

// TEST 9: Student Check-in & Duplicate Bed Prevention
runTest('Student Admission, Bed Assignment & Duplicate Bed Prevention', () => {
  const saiPG = db.state.hostels.find(h => h.name === 'Sai PG');
  const room101 = db.state.rooms.find(r => r.room_number === '101');
  const bed3 = db.state.beds.find(b => b.room_id === room101.id && b.bed_number === 3);
  assert.ok(bed3, 'Bed 3 in Room 101 must exist and be vacant');

  // Register new student on bed 3
  const newStudent = db.addStudent({
    hostel_id: saiPG.id,
    room_id: room101.id,
    bed_id: bed3.id,
    full_name: 'Vikramaditya Varma',
    mobile_number: '+91 97777 66666',
    email: 'vikram@hostel.com',
    agreed_monthly_rent: 6500,
    joining_date: '2026-11-20',
    emergency_contact: 'Subba Raju (Uncle)',
    emergency_phone: '+91 97777 00000'
  });

  assert.ok(newStudent.id);
  assert.ok(newStudent.student_id_code.startsWith('STU-2026-'));
  assert.strictEqual(newStudent.agreed_monthly_rent, 6500);
  assert.strictEqual(bed3.status, 'Occupied');

  // Attempting to register another student on the SAME bed 3 MUST be rejected!
  assert.throws(() => {
    db.addStudent({
      hostel_id: saiPG.id,
      room_id: room101.id,
      bed_id: bed3.id,
      full_name: 'Overbooking Impostor',
      mobile_number: '+91 90000 00000',
      agreed_monthly_rent: 6500
    });
  }, /Bed 3 is already occupied/);
});

// TEST 10: Vacating Student Automatically Releases Bed
runTest('Student Vacating Automatically Releases Bed Slot', () => {
  const vikram = db.state.students.find(s => s.full_name === 'Vikramaditya Varma');
  assert.ok(vikram);
  const bedId = vikram.bed_id;

  // Vacate student
  db.vacateStudent(vikram.id);

  assert.strictEqual(vikram.student_status, 'Vacated');
  assert.ok(vikram.vacated_date);

  // Bed must now be released to 'Available'
  const bed = db.state.beds.find(b => b.id === bedId);
  assert.strictEqual(bed.status, 'Available');
});

// TEST 11: Automated Rent Expiry Reminders (Asia/Kolkata Scheduler)
runTest('Automated Rent Expiry Reminders in Asia/Kolkata Timezone', () => {
  // Clear any existing test notification logs
  db.state.notification_logs = [];

  const res = db.runDailyReminders();
  assert.ok(res);
  assert.ok(res.today, 'Should have today date in IST');
  assert.ok(res.tomorrow, 'Should have tomorrow date in IST');

  // Verify logs were generated for Ravi (due tomorrow) and Suresh (due today)
  const logs = db.state.notification_logs;
  assert.ok(logs.length >= 2, 'Should generate reminders for due tomorrow and due today residents');

  const oneDayReminder = logs.find(l => l.reminder_type === 'one_day_before');
  const dueDayReminder = logs.find(l => l.reminder_type === 'due_date');

  assert.ok(oneDayReminder, '1 day before reminder must be triggered');
  assert.ok(dueDayReminder, 'Due day reminder must be triggered');

  // Check exact message templates
  assert.ok(oneDayReminder.message_body.includes('Your hostel rent payment is due tomorrow'));
  assert.ok(dueDayReminder.message_body.includes('Today is your hostel rent payment due date'));
});

// TEST 12: Duplicate Reminder Prevention
runTest('Duplicate Reminder Prevention (No repeat notifications on same day)', () => {
  const initialLogCount = db.state.notification_logs.length;

  // Running the scheduler a second time immediately
  const res2 = db.runDailyReminders();

  assert.strictEqual(res2.sent, 0, 'Scheduler must not send duplicate reminders on second run');
  assert.strictEqual(db.state.notification_logs.length, initialLogCount);
});

// TEST 13: Payment Recording Advances Due Date & Stops Reminders
runTest('Payment Recording Advances Due Date by +1 Month and Stops Reminders', () => {
  const suresh = db.state.students.find(s => s.full_name === 'Suresh Varma');
  assert.ok(suresh);
  const oldDueDate = suresh.next_payment_due_date;

  // Suresh makes payment of ₹6,000
  const payment = db.recordPayment({
    student_id: suresh.id,
    amount_paid: 6000,
    payment_method: 'UPI',
    transaction_ref: 'UPI/20261120/998811'
  });

  assert.ok(payment.id);
  assert.ok(payment.receipt_number.startsWith('RCP-2026-'));
  assert.strictEqual(payment.payment_status, 'Paid');
  assert.strictEqual(payment.pending_balance, 0);

  // Suresh's next payment due date must have advanced by 1 month!
  assert.notStrictEqual(suresh.next_payment_due_date, oldDueDate);
  const oldDateObj = new Date(oldDueDate);
  const newDateObj = new Date(suresh.next_payment_due_date);
  assert.ok(newDateObj > oldDateObj, 'Next due date must be in the future');

  // Reminders must now cease for Suresh
  const beforeCount = db.state.notification_logs.length;
  db.runDailyReminders();
  const afterCount = db.state.notification_logs.length;
  assert.strictEqual(beforeCount, afterCount, 'No new reminders should fire after payment is cleared');
});

// TEST 14: Payment Partial Tracking
runTest('Partial Payment Tracking & Remaining Pending Balance', () => {
  const ravi = db.state.students.find(s => s.full_name === 'Ravi Kumar');
  assert.ok(ravi);

  // Ravi pays ₹4,000 of ₹6,000
  const partialPayment = db.recordPayment({
    student_id: ravi.id,
    amount_paid: 4000,
    payment_method: 'Cash',
    notes: 'Partial installment payment'
  });

  assert.strictEqual(partialPayment.amount_paid, 4000);
  assert.strictEqual(partialPayment.pending_balance, 2000, 'Remaining balance should be ₹2,000');
  assert.strictEqual(partialPayment.payment_status, 'Partial');
});

// TEST 15: Executive Dashboard Financial & General Metrics
runTest('Executive Dashboard KPI Calculations & Real-time Aggregation', () => {
  const saiPG = db.state.hostels.find(h => h.name === 'Sai PG');
  const finMetrics = db.getFinancialMetrics(saiPG.id);
  const genMetrics = db.getGeneralMetrics(saiPG.id);

  assert.ok(finMetrics.totalExpectedRevenue > 0);
  assert.ok(finMetrics.totalRentCollected > 0);
  assert.ok(genMetrics.totalRooms > 0);
  assert.ok(genMetrics.totalBeds > 0);
  assert.ok(genMetrics.occupancyRate >= 0 && genMetrics.occupancyRate <= 100);
  assert.strictEqual(genMetrics.totalBeds, genMetrics.occupiedBeds + genMetrics.availableBeds);
});

// TEST 16: Persistence Across DB Re-instantiation (State Storage Simulation)
runTest('Database State Persistence Across Browser Refresh / Re-instantiation', () => {
  // Re-instantiate database from localStorage
  const freshDb = new window.DatabaseService();

  const hostels = freshDb.getHostels();
  assert.ok(hostels.find(h => h.name === 'Balaji Executive Boys PG'), 'Newly created hostel must persist');
  assert.ok(freshDb.state.students.find(s => s.full_name === 'Vikramaditya Varma'), 'New student must persist');
  assert.ok(freshDb.state.payments.find(p => p.transaction_ref === 'UPI/20261120/998811'), 'Payment must persist');
});

console.log('\n================================================================');
console.log(`ALL 16 SAAS ACCEPTANCE TESTS COMPLETED SUCCESSFULLY! (${passedTests}/${totalTests})`);
console.log('================================================================');

/**
 * Narasimha PG Hostel Manager v3.0 - Backend Server & Automation Scheduler
 * Node.js Express Server with Background Due-Date Scheduler, REST APIs, and Static Asset Server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'saas_database.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial Database Seed Data (Hyderabad Real World Context)
function getInitialDatabase() {
  const ownerId = '00000000-0000-4000-8000-000000000001';
  const student1UserId = '00000000-0000-4000-8000-000000000011';
  const student2UserId = '00000000-0000-4000-8000-000000000012';

  const hostel1Id = '11111111-1111-4000-8000-111111111111'; // Sai PG (Madhapur)
  const hostel2Id = '22222222-2222-4000-8000-222222222222'; // Lakshmi PG (Hitec City)
  const hostel3Id = '33333333-3333-4000-8000-333333333333'; // Sri Sai Boys Hostel (Ameerpet)

  const room101Id = '44444444-1111-4000-8000-000000000101'; // Sai PG Room 101
  const room102Id = '44444444-2222-4000-8000-000000000102'; // Lakshmi PG Room 102
  const room205Id = '44444444-3333-4000-8000-000000000205'; // Sri Sai Boys Hostel Room 205

  // Today in Asia/Kolkata
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return {
    profiles: [
      {
        id: ownerId,
        email: 'owner1@hostel.com',
        passwordHash: 'password123',
        full_name: 'Narasimha Rao',
        role: 'owner',
        mobile_number: '+91 98480 12345'
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        email: 'owner2@hostel.com',
        passwordHash: 'password123',
        full_name: 'Vikas Kuram',
        role: 'owner',
        mobile_number: '+91 91234 56780'
      },
      {
        id: student1UserId,
        email: 'ravi@gmail.com',
        passwordHash: 'student123',
        full_name: 'Ravi Kumar',
        role: 'student',
        mobile_number: '+91 98765 00001'
      },
      {
        id: student2UserId,
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
        owner_id: ownerId,
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
        owner_id: ownerId,
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
        owner_id: ownerId,
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
      { id: 'f-1', hostel_id: hostel1Id, floor_name: 'Ground Floor', floor_order: 0 },
      { id: 'f-2', hostel_id: hostel1Id, floor_name: '1st Floor', floor_order: 1 },
      { id: 'f-3', hostel_id: hostel1Id, floor_name: '2nd Floor', floor_order: 2 },
      { id: 'f-4', hostel_id: hostel1Id, floor_name: '3rd Floor', floor_order: 3 },
      { id: 'f-5', hostel_id: hostel2Id, floor_name: 'Ground Floor', floor_order: 0 },
      { id: 'f-6', hostel_id: hostel2Id, floor_name: '1st Floor', floor_order: 1 },
      { id: 'f-7', hostel_id: hostel3Id, floor_name: 'Ground Floor', floor_order: 0 },
      { id: 'f-8', hostel_id: hostel3Id, floor_name: '1st Floor', floor_order: 1 },
      { id: 'f-9', hostel_id: hostel3Id, floor_name: '2nd Floor', floor_order: 2 }
    ],
    pricing: [
      { id: 'p-1', hostel_id: hostel1Id, sharing_type: 1, price_per_person: 10000 },
      { id: 'p-2', hostel_id: hostel1Id, sharing_type: 2, price_per_person: 7000 },
      { id: 'p-3', hostel_id: hostel1Id, sharing_type: 3, price_per_person: 6000 },
      { id: 'p-4', hostel_id: hostel1Id, sharing_type: 4, price_per_person: 5000 },
      { id: 'p-5', hostel_id: hostel1Id, sharing_type: 5, price_per_person: 4500 },
      { id: 'p-6', hostel_id: hostel2Id, sharing_type: 1, price_per_person: 11000 },
      { id: 'p-7', hostel_id: hostel2Id, sharing_type: 2, price_per_person: 7500 },
      { id: 'p-8', hostel_id: hostel2Id, sharing_type: 3, price_per_person: 6500 },
      { id: 'p-9', hostel_id: hostel3Id, sharing_type: 1, price_per_person: 9500 },
      { id: 'p-10', hostel_id: hostel3Id, sharing_type: 2, price_per_person: 6500 },
      { id: 'p-11', hostel_id: hostel3Id, sharing_type: 3, price_per_person: 6000 }
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
      // Room 101 Sai PG
      { id: 'b-101-1', room_id: room101Id, bed_number: 1, status: 'Occupied' },
      { id: 'b-101-2', room_id: room101Id, bed_number: 2, status: 'Occupied' },
      { id: 'b-101-3', room_id: room101Id, bed_number: 3, status: 'Available' },
      // Room 102 Lakshmi PG
      { id: 'b-102-1', room_id: room102Id, bed_number: 1, status: 'Occupied' },
      { id: 'b-102-2', room_id: room102Id, bed_number: 2, status: 'Available' },
      // Room 205 Sri Sai Boys Hostel
      { id: 'b-205-1', room_id: room205Id, bed_number: 1, status: 'Occupied' },
      { id: 'b-205-2', room_id: room205Id, bed_number: 2, status: 'Occupied' },
      { id: 'b-205-3', room_id: room205Id, bed_number: 3, status: 'Available' }
    ],
    students: [
      {
        id: 's-1',
        owner_id: ownerId,
        user_id: student1UserId,
        student_id_code: 'STU-2026-001',
        full_name: 'Ravi Kumar',
        mobile_number: '+91 98765 00001',
        email: 'ravi@gmail.com',
        hostel_id: hostel1Id,
        room_id: room101Id,
        bed_id: 'b-101-1',
        sharing_type: 3,
        agreed_monthly_rent: 6000,
        joining_date: '2026-11-01',
        rent_start_date: '2026-11-01',
        next_payment_due_date: tomorrowStr, // Due tomorrow for reminder test!
        emergency_contact: 'Ram Kumar (Father)',
        emergency_phone: '+91 98765 99991',
        student_status: 'Active',
        created_at: '2026-11-01T10:00:00.000Z'
      },
      {
        id: 's-2',
        owner_id: ownerId,
        user_id: student2UserId,
        student_id_code: 'STU-2026-002',
        full_name: 'Suresh Varma',
        mobile_number: '+91 98765 00002',
        email: 'suresh@gmail.com',
        hostel_id: hostel1Id,
        room_id: room101Id,
        bed_id: 'b-101-2',
        sharing_type: 3,
        agreed_monthly_rent: 6000,
        joining_date: '2026-11-05',
        rent_start_date: '2026-11-05',
        next_payment_due_date: todayStr, // Due today for expiry day reminder test!
        emergency_contact: 'Satya Varma (Brother)',
        emergency_phone: '+91 98765 99992',
        student_status: 'Active',
        created_at: '2026-11-05T10:00:00.000Z'
      },
      {
        id: 's-3',
        owner_id: ownerId,
        user_id: null,
        student_id_code: 'STU-2026-003',
        full_name: 'Anil Reddy',
        mobile_number: '+91 98765 00003',
        email: 'anil.reddy@gmail.com',
        hostel_id: hostel2Id,
        room_id: room102Id,
        bed_id: 'b-102-1',
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
        id: 's-4',
        owner_id: ownerId,
        user_id: null,
        student_id_code: 'STU-2026-004',
        full_name: 'Mahesh Babu',
        mobile_number: '+91 98765 00004',
        email: 'mahesh@gmail.com',
        hostel_id: hostel3Id,
        room_id: room205Id,
        bed_id: 'b-205-1',
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
        id: 's-5',
        owner_id: ownerId,
        user_id: null,
        student_id_code: 'STU-2026-005',
        full_name: 'Praveen Teja',
        mobile_number: '+91 98765 00005',
        email: 'praveen@gmail.com',
        hostel_id: hostel3Id,
        room_id: room205Id,
        bed_id: 'b-205-2',
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
        id: 'pay-1',
        student_id: 's-1',
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
        notes: 'Joining rent paid via Google Pay',
        created_at: '2026-11-01T10:30:00.000Z'
      },
      {
        id: 'pay-2',
        student_id: 's-3',
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
        notes: 'Full month rent received',
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

// Read database
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, resetting:', err);
  }
  const initial = getInitialDatabase();
  writeDatabase(initial);
  return initial;
}

// Write database atomically
function writeDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// Scheduler: Run automatic rent reminder checks in Asia/Kolkata timezone
function runRentReminderScheduler() {
  const db = readDatabase();
  const now = new Date();
  
  // Format dates in Asia/Kolkata (YYYY-MM-DD)
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const todayStr = formatter.format(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatter.format(tomorrow);

  console.log(`[Scheduler] Checking rent payment due dates for today (${todayStr}) and tomorrow (${tomorrowStr})...`);

  let sentCount = 0;

  db.students.forEach(student => {
    if (student.student_status !== 'Active') return;

    const hostel = db.hostels.find(h => h.id === student.hostel_id) || { name: 'Narasimha PG' };
    const dueDate = student.next_payment_due_date;
    const amount = Number(student.agreed_monthly_rent).toLocaleString('en-IN');

    // Case A: One Day Before Due Date (Due Tomorrow)
    if (dueDate === tomorrowStr) {
      const exists = db.notification_logs.find(n => 
        n.student_id === student.id &&
        n.reminder_type === 'one_day_before' &&
        n.due_date === dueDate
      );

      if (!exists) {
        const messageBody = `Hello ${student.full_name},\n\nYour hostel rent payment is due tomorrow (${dueDate}).\n\nYour monthly hostel rent is ₹${amount}.\n\nKindly complete your payment tomorrow to avoid any inconvenience.\n\nThank you.\n${hostel.name}`;

        db.notification_logs.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 10),
          student_id: student.id,
          hostel_id: student.hostel_id,
          reminder_type: 'one_day_before',
          due_date: dueDate,
          recipient_mobile: student.mobile_number,
          channel: 'WhatsApp',
          message_body: messageBody,
          status: db.messaging_config.test_mode ? 'Simulated' : 'Sent',
          sent_at: new Date().toISOString()
        });
        sentCount++;
        console.log(`[Scheduler] Sent 1-day-before reminder to ${student.full_name} (${student.mobile_number})`);
      }
    }

    // Case B: On the Expiry / Due Date (Due Today)
    if (dueDate === todayStr) {
      const exists = db.notification_logs.find(n => 
        n.student_id === student.id &&
        n.reminder_type === 'due_date' &&
        n.due_date === dueDate
      );

      if (!exists) {
        const messageBody = `Hello ${student.full_name},\n\nToday is your hostel rent payment due date.\n\nYour payment of ₹${amount} is due today.\n\nKindly make your payment today.\n\nThank you.\n${hostel.name}`;

        db.notification_logs.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 10),
          student_id: student.id,
          hostel_id: student.hostel_id,
          reminder_type: 'due_date',
          due_date: dueDate,
          recipient_mobile: student.mobile_number,
          channel: 'WhatsApp',
          message_body: messageBody,
          status: db.messaging_config.test_mode ? 'Simulated' : 'Sent',
          sent_at: new Date().toISOString()
        });
        sentCount++;
        console.log(`[Scheduler] Sent due-date reminder to ${student.full_name} (${student.mobile_number})`);
      }
    }
  });

  if (sentCount > 0) {
    writeDatabase(db);
  }
  return { checked: db.students.length, sentCount, today: todayStr, tomorrow: tomorrowStr };
}

// MIME Types for Static Assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Router
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname, method, parsedUrl);
    return;
  }

  // Static File Server
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: stay within workspace
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client-side routing
      filePath = path.join(__dirname, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// JSON Body Parser helper
function readJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (e) {
      callback(e, null);
    }
  });
}

// API Request Handler
function handleApiRequest(req, res, pathname, method, parsedUrl) {
  const db = readDatabase();

  const sendJson = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };

  // Health check
  if (pathname === '/api/health') {
    sendJson(200, { status: 'healthy', version: '3.0.0', time: new Date().toISOString() });
    return;
  }

  // Trigger Scheduler
  if (pathname === '/api/reminders/run' && method === 'POST') {
    const result = runRentReminderScheduler();
    sendJson(200, { success: true, ...result });
    return;
  }

  // Get full database (Sync for UI & tests)
  if (pathname === '/api/db' && method === 'GET') {
    sendJson(200, db);
    return;
  }

  // Reset database to seed data
  if (pathname === '/api/db/reset' && method === 'POST') {
    const fresh = getInitialDatabase();
    writeDatabase(fresh);
    sendJson(200, { success: true, message: 'Database reset to seed data' });
    return;
  }

  // Auth: Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    readJsonBody(req, (err, data) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const { email, password, role } = data;
      const user = db.profiles.find(p => p.email.toLowerCase() === (email || '').trim().toLowerCase());
      if (!user || user.passwordHash !== password) {
        return sendJson(401, { error: 'Invalid email or password.' });
      }
      if (role && user.role !== role) {
        return sendJson(403, { error: `User is not authorized as a ${role}.` });
      }
      sendJson(200, { user });
    });
    return;
  }

  // Record Payment
  if (pathname === '/api/payments' && method === 'POST') {
    readJsonBody(req, (err, data) => {
      if (err) return sendJson(400, { error: 'Invalid JSON' });
      const { student_id, amount_paid, payment_method, transaction_ref, notes } = data;
      const student = db.students.find(s => s.id === student_id);
      if (!student) return sendJson(404, { error: 'Student not found.' });

      const paid = parseFloat(amount_paid) || 0;
      const rent = parseFloat(student.agreed_monthly_rent) || 0;
      const pending = Math.max(0, rent - paid);
      const paymentStatus = pending === 0 ? 'Paid' : 'Partial';

      // Advance due date by 1 month
      const currentDue = new Date(student.next_payment_due_date);
      currentDue.setMonth(currentDue.getMonth() + 1);
      const nextDueStr = currentDue.toISOString().split('T')[0];

      const receiptNumber = 'RCP-2026-' + (db.payments.length + 1).toString().padStart(3, '0');

      const payment = {
        id: 'pay-' + Math.random().toString(36).substring(2, 10),
        student_id: student.id,
        hostel_id: student.hostel_id,
        room_id: student.room_id,
        monthly_rent: rent,
        amount_paid: paid,
        pending_balance: pending,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: payment_method || 'UPI',
        transaction_ref: transaction_ref || '',
        billing_cycle_month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        next_due_date: nextDueStr,
        payment_status: paymentStatus,
        receipt_number: receiptNumber,
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      db.payments.push(payment);
      student.next_payment_due_date = nextDueStr;
      writeDatabase(db);

      sendJson(201, { success: true, payment, student });
    });
    return;
  }

  // Fallback API 404
  sendJson(404, { error: 'API route not found' });
}

// Initial DB write on startup
readDatabase();

// Run scheduler on startup & schedule every 24 hours
runRentReminderScheduler();
setInterval(runRentReminderScheduler, 24 * 60 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Narasimha PG Hostel Manager v3.0 running at http://localhost:${PORT}`);
});

module.exports = { server, readDatabase, writeDatabase, runRentReminderScheduler };

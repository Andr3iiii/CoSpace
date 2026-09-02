const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cospace_db',
});

const CLIENT_API = 'http://localhost:3001/api/client';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function verifyAddonUnitPrice() {
  console.log('================================================================');
  console.log('🧪 COSPACE QA TEST: ADD-ON UNIT PRICE & SUBTOTAL VALIDATION');
  console.log('================================================================\n');

  // 1. Authenticate client
  const clientAuth = await request(`${CLIENT_API}/auth/login`, { method: 'POST' }, {
    email: 'client@cospace.com',
    password: 'Client@123456',
  });
  if (clientAuth.status !== 200) throw new Error('Client login failed');
  const token = clientAuth.data.data.token;

  // 2. Fetch workspace details with add-ons
  const wsRes = await request(`${CLIENT_API}/workspaces`);
  const workspace = wsRes.data.data[0];
  const wsDetailRes = await request(`${CLIENT_API}/workspaces/${workspace.id}`);
  const addOns = wsDetailRes.data.data.availableAddOns || [];

  if (addOns.length === 0) {
    throw new Error('No add-ons available on workspace');
  }

  console.log(`Found ${addOns.length} add-ons for workspace: "${workspace.name}"`);
  console.log('Available Add-ons:', addOns.map(a => `${a.name} (ID: ${a.id}, Price: ₱${a.price})`));

  // 3. Create booking with 2 distinct add-ons
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 90 + Math.floor(Math.random() * 50));
  targetDate.setHours(10, 0, 0, 0);
  const endDate = new Date(targetDate);
  endDate.setHours(endDate.getHours() + 4);

  const selectedAddonsPayload = [
    { addOnId: addOns[0].id, quantity: 2 },
  ];
  if (addOns[1]) {
    selectedAddonsPayload.push({ addOnId: addOns[1].id, quantity: 1 });
  }

  console.log('\nSubmitting booking with add-on payload:', JSON.stringify(selectedAddonsPayload, null, 2));

  const bookingRes = await request(
    `${CLIENT_API}/bookings`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
    {
      workspaceId: workspace.id,
      startTime: targetDate.toISOString(),
      endTime: endDate.toISOString(),
      specialRequests: 'Add-on Unit Price Verification Test',
      addOns: selectedAddonsPayload,
    }
  );

  if (bookingRes.status !== 201 && bookingRes.status !== 200) {
    throw new Error(`Booking creation failed: ${JSON.stringify(bookingRes.data)}`);
  }

  const bookingId = bookingRes.data.data.id;
  console.log(`✅ Booking created successfully with ID: ${bookingId}`);

  // 4. Query PostgreSQL database directly for booking_add_ons rows
  const dbResult = await pool.query(
    `SELECT 
      ba.id, 
      ba.booking_id, 
      ba.add_on_id, 
      a.name AS addon_name, 
      a.price AS catalog_price,
      ba.quantity, 
      ba.unit_price, 
      ba.subtotal 
     FROM booking_add_ons ba
     JOIN add_ons a ON ba.add_on_id = a.id
     WHERE ba.booking_id = $1`,
    [bookingId]
  );

  console.log('\n--- DATABASE INSPECTION: booking_add_ons ---');
  console.table(dbResult.rows);

  if (dbResult.rows.length === 0) {
    throw new Error('❌ FAIL: No booking_add_ons rows found in database!');
  }

  let allPassed = true;
  for (const row of dbResult.rows) {
    const unitPriceNum = parseFloat(row.unit_price);
    const subtotalNum = parseFloat(row.subtotal);
    const catalogPriceNum = parseFloat(row.catalog_price);
    const expectedSubtotal = Math.round(unitPriceNum * row.quantity * 100) / 100;

    console.log(`\nEvaluating: "${row.addon_name}"`);
    console.log(`   - Catalog Price: ₱${catalogPriceNum}`);
    console.log(`   - Recorded Unit Price: ₱${unitPriceNum}`);
    console.log(`   - Quantity: ${row.quantity}`);
    console.log(`   - Recorded Subtotal: ₱${subtotalNum} (Expected: ₱${expectedSubtotal})`);

    if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
      console.error(`❌ FAIL: unit_price is missing or zero: ${row.unit_price}`);
      allPassed = false;
    } else if (unitPriceNum !== catalogPriceNum) {
      console.error(`❌ FAIL: unit_price (₱${unitPriceNum}) does not match catalog authoritative price (₱${catalogPriceNum})`);
      allPassed = false;
    } else if (subtotalNum !== expectedSubtotal) {
      console.error(`❌ FAIL: subtotal (₱${subtotalNum}) does not equal unit_price * quantity (₱${expectedSubtotal})`);
      allPassed = false;
    } else {
      console.log(`   ✅ PASS: Authoritative unit_price, quantity, and subtotal perfectly matched in PostgreSQL!`);
    }
  }

  if (allPassed) {
    console.log('\n================================================================');
    console.log('🏆 ADD-ON UNIT PRICE & SUBTOTAL VALIDATION PASSED 100%');
    console.log('================================================================\n');
  } else {
    throw new Error('One or more add-on pricing validations failed.');
  }

  await pool.end();
}

verifyAddonUnitPrice().catch(async (err) => {
  console.error('Fatal test error:', err);
  await pool.end();
  process.exit(1);
});

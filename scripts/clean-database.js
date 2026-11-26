const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // 1. Wipe fake attendance records
    const attResult = await db.collection('attendances').deleteMany({});
    console.log(`Deleted ${attResult.deletedCount} fake attendance records`);

    // 2. Wipe fake leave requests
    const leaveResult = await db.collection('leaves').deleteMany({});
    console.log(`Deleted ${leaveResult.deletedCount} fake leave requests`);

    // 3. Wipe fake payroll records
    const payResult = await db.collection('payrolls').deleteMany({});
    console.log(`Deleted ${payResult.deletedCount} fake payroll records`);

    // 4. Wipe fake notifications
    const notifResult = await db.collection('notifications').deleteMany({});
    console.log(`Deleted ${notifResult.deletedCount} fake notifications`);

    // 5. Clean up unused legacy collections if any
    const legacyCollections = [
      'schoolpurchaserequests', 'studentprofiles', 'attendancecredentials',
      'schoolclasses', 'rfiddevices', 'schoolinventories', 'schoolsuppliers', 'selfies'
    ];
    for (const colName of legacyCollections) {
      try {
        await db.collection(colName).drop();
        console.log(`Dropped legacy collection: ${colName}`);
      } catch (e) {
        // collection might not exist, ignore
      }
    }

    // 6. Delete all fake users EXCEPT admin@attendance.com and employee@attendance.com
    const userResult = await db.collection('users').deleteMany({
      email: { $nin: ['admin@attendance.com', 'employee@attendance.com'] }
    });
    console.log(`Deleted ${userResult.deletedCount} fake user accounts`);

    // 7. Ensure Admin account exists and is active
    const adminHash = await bcrypt.hash('admin', 12);
    await db.collection('users').updateOne(
      { email: 'admin@attendance.com' },
      {
        $set: {
          name: 'Office Admin',
          email: 'admin@attendance.com',
          password: adminHash,
          role: 'admin',
          isActive: true,
          employeeId: 'ADMIN-001',
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );
    console.log('Admin account verified [admin@attendance.com / admin]');

    // 8. Ensure Demo Employee account exists and is active
    const empHash = await bcrypt.hash('employee', 12);
    await db.collection('users').updateOne(
      { email: 'employee@attendance.com' },
      {
        $set: {
          name: 'Demo Employee',
          email: 'employee@attendance.com',
          password: empHash,
          role: 'employee',
          employeeId: 'EMP-001',
          isActive: true,
          leaveBalance: { annual: 20, sick: 10, casual: 5 },
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );
    console.log('Employee account verified [EMP-001 / employee@attendance.com / employee]');

    // 9. Ensure clean default shift
    await db.collection('shifts').deleteMany({});
    const shift = await db.collection('shifts').insertOne({
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriodMinutes: 15,
      isDefault: true,
      workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
      createdAt: new Date(),
    });
    console.log('Created default General Shift (09:00 - 18:00)');

    // 10. Ensure clean default departments
    await db.collection('departments').deleteMany({});
    await db.collection('departments').insertMany([
      { name: 'Management', description: 'Office Management & Leadership', createdAt: new Date() },
      { name: 'Operations', description: 'Core Business Operations', createdAt: new Date() },
      { name: 'Sales & Marketing', description: 'Sales, Marketing & Accounts', createdAt: new Date() },
      { name: 'Staff', description: 'Office & Support Staff', createdAt: new Date() },
    ]);
    console.log('Created 4 clean office departments');

    console.log('\n--- DATABASE CLEANUP COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Database clean error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanDatabase();

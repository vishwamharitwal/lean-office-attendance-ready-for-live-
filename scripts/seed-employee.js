const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedEmployee() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('employee', 12);
    let emp = await mongoose.connection.collection('users').findOne({ email: 'employee@attendance.com' });

    if (emp) {
      await mongoose.connection.collection('users').updateOne(
        { _id: emp._id },
        {
          $set: {
            password: hashedPassword,
            role: 'employee',
            isActive: true,
            employeeId: 'EMP-001'
          }
        }
      );
      console.log('Updated employee@attendance.com password to employee');
    } else {
      await mongoose.connection.collection('users').insertOne({
        name: 'Demo Employee',
        email: 'employee@attendance.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP-001',
        isActive: true,
        createdAt: new Date(),
        leaveBalance: { annual: 15, sick: 10, casual: 7 }
      });
      console.log('Created employee@attendance.com with password employee');
    }
  } catch (err) {
    console.error('Error seeding employee:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedEmployee();

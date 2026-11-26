const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin', 12);
    
    // Find or create admin
    let admin = await mongoose.connection.collection('users').findOne({
      $or: [
        { email: 'admin@attendance.com' },
        { email: 'admin' },
        { role: 'admin' }
      ]
    });

    if (admin) {
      await mongoose.connection.collection('users').updateOne(
        { _id: admin._id },
        {
          $set: {
            password: hashedPassword,
            isActive: true,
            role: 'admin'
          }
        }
      );
      console.log(`Updated admin user [${admin.email}] password to 'admin'`);
    } else {
      const result = await mongoose.connection.collection('users').insertOne({
        name: 'Office Admin',
        email: 'admin@attendance.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created new admin user with password: admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

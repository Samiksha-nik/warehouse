require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createDeveloper = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventoryDB');
    console.log('Connected to MongoDB');

    // Check if developer already exists
    const existingDeveloper = await User.findOne({ email: 'developer@example.com' });
    if (existingDeveloper) {
      console.log('Developer user already exists');
      process.exit(0);
    }

    // Create developer user
    const developer = new User({
      name: 'Developer User',
      email: 'developer@example.com',
      password: 'dev12345', // This will be hashed by the User model
      role: 'developer'
    });

    await developer.save();
    console.log('Developer user created successfully');
    console.log('Email: developer@example.com');
    console.log('Password: dev12345');

  } catch (error) {
    console.error('Error creating developer:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createDeveloper(); 
const mongoose = require('mongoose');
require('dotenv').config();

async function dropLabelNumberIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the Label collection
    const Label = mongoose.model('Label');
    const collection = Label.collection;

    // Drop the labelNumber index
    await collection.dropIndex('labelNumber_1');
    console.log('Successfully dropped labelNumber index');

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropLabelNumberIndex(); 
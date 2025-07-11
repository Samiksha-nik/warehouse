const mongoose = require('mongoose');
const Address = require('../models/Address');

async function fixAddressObjectIds() {
  await mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME'); // Change DB name

  const addresses = await Address.find({});
  for (const addr of addresses) {
    let updated = false;
    if (addr.city && typeof addr.city === 'string' && addr.city.length === 24) {
      addr.city = mongoose.Types.ObjectId(addr.city);
      updated = true;
    }
    if (addr.state && typeof addr.state === 'string' && addr.state.length === 24) {
      addr.state = mongoose.Types.ObjectId(addr.state);
      updated = true;
    }
    if (updated) {
      await addr.save();
      console.log(`Updated address ${addr._id}`);
    }
  }
  console.log('Done!');
  process.exit();
}

fixAddressObjectIds(); 
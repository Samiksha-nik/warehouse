const mongoose = require('mongoose');
const Address = require('../models/Address');
const City = require('../models/City');
const State = require('../models/State');

async function fixCityStateMasterData() {
  await mongoose.connect('mongodb://localhost:27017/inventoryDB');

  const addresses = await Address.find({});
  const cityIds = new Set();
  const stateIds = new Set();

  addresses.forEach(addr => {
    if (addr.city && typeof addr.city === 'object' && addr.city._bsontype === 'ObjectID') cityIds.add(addr.city.toString());
    if (addr.state && typeof addr.state === 'object' && addr.state._bsontype === 'ObjectID') stateIds.add(addr.state.toString());
  });

  // Check and create missing cities
  for (const cityId of cityIds) {
    const city = await City.findById(cityId);
    if (!city) {
      await City.create({ _id: cityId, cityName: 'Unknown City' });
      console.log(`Created missing city: ${cityId}`);
    }
  }

  // Check and create missing states
  for (const stateId of stateIds) {
    const state = await State.findById(stateId);
    if (!state) {
      await State.create({ _id: stateId, stateName: 'Unknown State' });
      console.log(`Created missing state: ${stateId}`);
    }
  }

  console.log('City/State master data check complete!');
  process.exit();
}

fixCityStateMasterData(); 
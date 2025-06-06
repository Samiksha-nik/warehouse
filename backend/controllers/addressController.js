const Address = require('../models/Address');

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const address = new Address(req.body);
    const savedAddress = await address.save();
    res.status(201).json(savedAddress); // Return the complete saved address object including _id
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find()
      .populate('country')
      .populate('state')
      .populate('city');
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get address by ID
exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id)
      .populate('country')
      .populate('state')
      .populate('city');
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('country').populate('state').populate('city');
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
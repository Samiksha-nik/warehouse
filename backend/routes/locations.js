const router = require('express').Router();
let Location = require('../models/Location');

// Get all locations
router.route('/').get((req, res) => {
  Location.find()
    .populate('company', 'companyName companyCode')
    .populate('country', 'countryName')
    .populate('state', 'stateName')
    .populate('city', 'cityName')
    .then(locations => res.json(locations))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get locations by company ID
router.route('/company/:companyId').get((req, res) => {
  Location.find({ company: req.params.companyId })
    .populate('company', 'companyName companyCode')
    .populate('country', 'countryName')
    .populate('state', 'stateName')
    .populate('city', 'cityName')
    .then(locations => res.json(locations))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get a specific location by ID
router.route('/:id').get((req, res) => {
  Location.findById(req.params.id)
    .populate('company', 'companyName companyCode')
    .populate('country', 'countryName')
    .populate('state', 'stateName')
    .populate('city', 'cityName')
    .then(location => res.json(location))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new location
router.route('/add').post((req, res) => {
  const {
    locationCode,
    locationName,
    company,
    addressLine1,
    addressLine2,
    country,
    state,
    city,
    pincode,
    telephone,
    mobile,
    fax,
    email,
    gstinNo,
    pan,
    remarks,
    status
  } = req.body;

  const newLocation = new Location({
    locationCode,
    locationName,
    company,
    addressLine1,
    addressLine2,
    country,
    state,
    city,
    pincode,
    telephone,
    mobile,
    fax,
    email,
    gstinNo,
    pan,
    remarks,
    status: status || 'active'
  });

  newLocation.save()
    .then(() => res.json('Location added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a location
router.route('/update/:id').post((req, res) => {
  Location.findById(req.params.id)
    .then(location => {
      location.locationCode = req.body.locationCode;
      location.locationName = req.body.locationName;
      location.company = req.body.company;
      location.addressLine1 = req.body.addressLine1;
      location.addressLine2 = req.body.addressLine2;
      location.country = req.body.country;
      location.state = req.body.state;
      location.city = req.body.city;
      location.pincode = req.body.pincode;
      location.telephone = req.body.telephone;
      location.mobile = req.body.mobile;
      location.fax = req.body.fax;
      location.email = req.body.email;
      location.gstinNo = req.body.gstinNo;
      location.pan = req.body.pan;
      location.remarks = req.body.remarks;
      location.status = req.body.status;

      location.save()
        .then(() => res.json('Location updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a location
router.route('/delete/:id').delete((req, res) => {
  Location.findByIdAndDelete(req.params.id)
    .then(() => res.json('Location deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router; 
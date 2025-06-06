const router = require('express').Router();
let Company = require('../models/Company');

// Get all companies
router.route('/').get((req, res) => {
  Company.find()
    .populate('country', 'countryName')
    .populate('state', 'stateName')
    .populate('city', 'cityName')
    .then(companies => res.json(companies))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get a specific company by ID
router.route('/:id').get((req, res) => {
  Company.findById(req.params.id)
    .populate('country', 'countryName')
    .populate('state', 'stateName')
    .populate('city', 'cityName')
    .then(company => res.json(company))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new company
router.route('/add').post((req, res) => {
  const {
    companyCode,
    companyName,
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
    defaultLocation,
    status
  } = req.body;

  const newCompany = new Company({
    companyCode,
    companyName,
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
    defaultLocation,
    status: status || 'active'
  });

  newCompany.save()
    .then(() => res.json('Company added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a company
router.route('/update/:id').post((req, res) => {
  Company.findById(req.params.id)
    .then(company => {
      company.companyCode = req.body.companyCode;
      company.companyName = req.body.companyName;
      company.addressLine1 = req.body.addressLine1;
      company.addressLine2 = req.body.addressLine2;
      company.country = req.body.country;
      company.state = req.body.state;
      company.city = req.body.city;
      company.pincode = req.body.pincode;
      company.telephone = req.body.telephone;
      company.mobile = req.body.mobile;
      company.fax = req.body.fax;
      company.email = req.body.email;
      company.gstinNo = req.body.gstinNo;
      company.pan = req.body.pan;
      company.remarks = req.body.remarks;
      company.defaultLocation = req.body.defaultLocation;
      company.status = req.body.status;

      company.save()
        .then(() => res.json('Company updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a company
router.route('/delete/:id').delete((req, res) => {
  Company.findByIdAndDelete(req.params.id)
    .then(() => res.json('Company deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router; 
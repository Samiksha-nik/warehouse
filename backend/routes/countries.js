const router = require('express').Router();
let Country = require('../models/Country');

// Get all countries
router.route('/').get((req, res) => {
  Country.find()
    .then(countries => res.json(countries))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get a specific country by ID
router.route('/:id').get((req, res) => {
  Country.findById(req.params.id)
    .then(country => res.json(country))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new country
router.route('/add').post((req, res) => {
  const countryName = req.body.countryName;
  const countryCode = req.body.countryCode;
  const remarks = req.body.remarks;
  const status = req.body.status || 'active'; // Default to active if not provided

  const newCountry = new Country({
    countryName,
    countryCode,
    remarks,
    status,
  });

  newCountry.save()
    .then(savedCountry => res.json(savedCountry))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a country by ID
router.route('/update/:id').post((req, res) => {
  Country.findById(req.params.id)
    .then(country => {
      country.countryName = req.body.countryName;
      country.countryCode = req.body.countryCode;
      country.remarks = req.body.remarks;
      country.status = req.body.status;

      country.save()
        .then(updatedCountry => res.json(updatedCountry))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a country by ID
router.route('/delete/:id').delete((req, res) => {
  Country.findByIdAndDelete(req.params.id)
    .then(() => res.json('Country deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router; 
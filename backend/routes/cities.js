const router = require('express').Router();
let City = require('../models/City');

// Get all cities
router.route('/').get((req, res) => {
  City.find()
    .populate('state', 'stateName stateCode') // Populate state details
    .populate('country', 'countryName countryCode') // Populate country details
    .then(cities => res.json(cities))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get cities by state ID
router.route('/state/:stateId').get((req, res) => {
  City.find({ state: req.params.stateId })
    .populate('state', 'stateName stateCode')
    .populate('country', 'countryName countryCode')
    .then(cities => res.json(cities))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get a specific city by ID
router.route('/:id').get((req, res) => {
  City.findById(req.params.id)
    .populate('state', 'stateName stateCode')
    .populate('country', 'countryName countryCode')
    .then(city => res.json(city))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new city
router.route('/add').post((req, res) => {
  const cityName = req.body.cityName;
  const cityCode = req.body.cityCode;
  const state = req.body.state; // Expecting state ID
  const country = req.body.country; // Expecting country ID
  const remarks = req.body.remarks;
  const status = req.body.status || 'active';

  const newCity = new City({
    cityName,
    cityCode,
    state,
    country,
    remarks,
    status,
  });

  newCity.save()
    .then(savedCity => res.json(savedCity)) // Return the saved city object
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a city by ID
router.route('/update/:id').post((req, res) => {
  City.findById(req.params.id)
    .then(city => {
      city.cityName = req.body.cityName;
      city.cityCode = req.body.cityCode;
      city.state = req.body.state; // Expecting state ID
      city.country = req.body.country; // Expecting country ID
      city.remarks = req.body.remarks;
      city.status = req.body.status;

      city.save()
        .then(updatedCity => res.json(updatedCity)) // Return the updated city object
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a city by ID
router.route('/delete/:id').delete((req, res) => {
  City.findByIdAndDelete(req.params.id)
    .then(() => res.json('City deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router; 
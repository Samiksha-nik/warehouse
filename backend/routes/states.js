const router = require('express').Router();
let State = require('../models/State');

// Get all states
router.route('/').get((req, res) => {
  State.find().populate('country', 'countryName countryCode') // Populate country details
    .then(states => res.json(states))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get states by country ID
router.route('/country/:countryId').get((req, res) => {
  State.find({ country: req.params.countryId })
    .populate('country', 'countryName countryCode')
    .then(states => res.json(states))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get a specific state by ID
router.route('/:id').get((req, res) => {
  State.findById(req.params.id).populate('country', 'countryName countryCode') // Populate country details
    .then(state => res.json(state))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new state
router.route('/add').post((req, res) => {
  const stateName = req.body.stateName;
  const stateCode = req.body.stateCode;
  const country = req.body.country; // Expecting country ID
  const remarks = req.body.remarks;
  const status = req.body.status || 'active';

  const newState = new State({
    stateName,
    stateCode,
    country,
    remarks,
    status,
  });

  newState.save()
    .then(savedState => res.json(savedState)) // Return the saved state object
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a state by ID
router.route('/update/:id').post((req, res) => {
  State.findById(req.params.id)
    .then(state => {
      state.stateName = req.body.stateName;
      state.stateCode = req.body.stateCode;
      state.country = req.body.country; // Expecting country ID
      state.remarks = req.body.remarks;
      state.status = req.body.status;

      state.save()
        .then(updatedState => res.json(updatedState)) // Return the updated state object
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a state by ID
router.route('/delete/:id').delete((req, res) => {
  State.findByIdAndDelete(req.params.id)
    .then(() => res.json('State deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router; 
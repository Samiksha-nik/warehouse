const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Get all orders and create new order
router.route('/')
  .get(orderController.getOrders)
  .post(orderController.createOrder);

// Get pending orders
router.get('/pending', orderController.getPendingOrders);

// Approve order
router.put('/:id/approve', orderController.approveOrder);

// Reject order
router.put('/:id/reject', orderController.rejectOrder);

// Get, update and delete specific order
router.route('/:id')
  .get(orderController.getOrder)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router; 
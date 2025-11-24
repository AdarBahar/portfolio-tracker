const express = require('express');
const { placeOrder, listOrders, listPositions } = require('../controllers/bullPenOrdersController');

const router = express.Router();

// /api/bull-pens/:id/orders
router.post('/:id/orders', placeOrder);
router.get('/:id/orders', listOrders);

// /api/bull-pens/:id/positions
router.get('/:id/positions', listPositions);

module.exports = router;


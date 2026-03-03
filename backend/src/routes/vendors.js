const express = require('express');
const router = express.Router();
const { getVendors, createVendor } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getVendors);                    // OPS + FINANCE
router.post('/', protect, authorize('OPS'), createVendor); // OPS only

module.exports = router;

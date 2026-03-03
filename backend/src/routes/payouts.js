const express = require('express');
const router = express.Router();
const {
    getPayouts,
    getPayoutById,
    createPayout,
    submitPayout,
    approvePayout,
    rejectPayout
} = require('../controllers/payoutController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getPayouts);      // OPS + FINANCE
router.post('/', protect, authorize('OPS'), createPayout);    // OPS only
router.get('/:id', protect, getPayoutById);   // OPS + FINANCE
router.post('/:id/submit', protect, authorize('OPS'), submitPayout);    // OPS only
router.post('/:id/approve', protect, authorize('FINANCE'), approvePayout);   // FINANCE only
router.post('/:id/reject', protect, authorize('FINANCE'), rejectPayout);    // FINANCE only

module.exports = router;

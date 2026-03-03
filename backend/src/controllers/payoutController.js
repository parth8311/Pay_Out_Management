const Payout = require('../models/Payout');
const PayoutAudit = require('../models/PayoutAudit');
const Vendor = require('../models/Vendor');

// Helper: Create audit entry
const createAudit = async (payout_id, action, performed_by, note = null) => {
    await PayoutAudit.create({ payout_id, action, performed_by, note });
};

// @route   GET /api/payouts
// @access  Private (OPS + FINANCE)
exports.getPayouts = async (req, res) => {
    try {
        const { status, vendor_id } = req.query;
        const filter = {};

        if (status && ['Draft', 'Submitted', 'Approved', 'Rejected'].includes(status)) {
            filter.status = status;
        }
        if (vendor_id) filter.vendor_id = vendor_id;

        const payouts = await Payout.find(filter)
            .populate('vendor_id', 'name upi_id is_active')
            .populate('created_by', 'email role')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: payouts.length, data: payouts });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @route   GET /api/payouts/:id
// @access  Private (OPS + FINANCE)
exports.getPayoutById = async (req, res) => {
    try {
        const payout = await Payout.findById(req.params.id)
            .populate('vendor_id', 'name upi_id bank_account ifsc is_active')
            .populate('created_by', 'email role');

        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found.' });
        }

        const audits = await PayoutAudit.find({ payout_id: payout._id })
            .populate('performed_by', 'email role')
            .sort({ createdAt: 1 });

        res.json({ success: true, data: payout, audits });
    } catch (error) {
        console.error('Get payout error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid payout ID.' });
        }
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @route   POST /api/payouts
// @access  Private (OPS only)
exports.createPayout = async (req, res) => {
    try {
        const { vendor_id, amount, mode, note } = req.body;

        // Validate
        if (!vendor_id) {
            return res.status(400).json({ success: false, message: 'Vendor is required.' });
        }
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
        }
        if (!mode || !['UPI', 'IMPS', 'NEFT'].includes(mode)) {
            return res.status(400).json({ success: false, message: 'Mode must be UPI, IMPS, or NEFT.' });
        }

        // Check vendor
        const vendor = await Vendor.findById(vendor_id);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
        if (!vendor.is_active) return res.status(400).json({ success: false, message: 'Selected vendor is inactive.' });

        const payout = await Payout.create({
            vendor_id,
            amount: Number(amount),
            mode,
            note: note?.trim() || null,
            status: 'Draft',
            created_by: req.user.userId
        });

        await createAudit(payout._id, 'CREATED', req.user.userId);

        const populated = await Payout.findById(payout._id)
            .populate('vendor_id', 'name upi_id')
            .populate('created_by', 'email role');

        res.status(201).json({
            success: true,
            message: 'Payout created as Draft.',
            data: populated
        });
    } catch (error) {
        console.error('Create payout error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @route   POST /api/payouts/:id/submit
// @access  Private (OPS only) — Draft → Submitted
exports.submitPayout = async (req, res) => {
    try {
        const payout = await Payout.findById(req.params.id);
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found.' });

        if (payout.status !== 'Draft') {
            return res.status(400).json({
                success: false,
                message: `Cannot submit. Current status is '${payout.status}'. Only Draft payouts can be submitted.`
            });
        }

        payout.status = 'Submitted';
        await payout.save();
        await createAudit(payout._id, 'SUBMITTED', req.user.userId);

        res.json({ success: true, message: 'Payout submitted for approval.', data: payout });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @route   POST /api/payouts/:id/approve
// @access  Private (FINANCE only) — Submitted → Approved
exports.approvePayout = async (req, res) => {
    try {
        const payout = await Payout.findById(req.params.id);
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found.' });

        if (payout.status !== 'Submitted') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve. Current status is '${payout.status}'. Only Submitted payouts can be approved.`
            });
        }

        payout.status = 'Approved';
        await payout.save();
        await createAudit(payout._id, 'APPROVED', req.user.userId);

        res.json({ success: true, message: 'Payout approved successfully.', data: payout });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @route   POST /api/payouts/:id/reject
// @access  Private (FINANCE only) — Submitted → Rejected
exports.rejectPayout = async (req, res) => {
    try {
        const { decision_reason } = req.body;

        if (!decision_reason || decision_reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason (decision_reason) is mandatory.'
            });
        }

        const payout = await Payout.findById(req.params.id);
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found.' });

        if (payout.status !== 'Submitted') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject. Current status is '${payout.status}'. Only Submitted payouts can be rejected.`
            });
        }

        payout.status = 'Rejected';
        payout.decision_reason = decision_reason.trim();
        await payout.save();
        await createAudit(payout._id, 'REJECTED', req.user.userId, decision_reason.trim());

        res.json({ success: true, message: 'Payout rejected.', data: payout });
    } catch (error) {
        console.error('Reject error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

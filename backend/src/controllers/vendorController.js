const Vendor = require('../models/Vendor');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private (OPS + FINANCE)
exports.getVendors = async (req, res) => {
    try {
        const filter = {};
        if (req.query.is_active !== undefined) {
            filter.is_active = req.query.is_active === 'true';
        }

        const vendors = await Vendor.find(filter).sort({ createdAt: -1 });

        res.json({ success: true, count: vendors.length, data: vendors });
    } catch (error) {
        console.error('Get vendors error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Create vendor
// @route   POST /api/vendors
// @access  Private (OPS only)
exports.createVendor = async (req, res) => {
    try {
        const { name, upi_id, bank_account, ifsc, is_active } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Vendor name is required and must be at least 2 characters.'
            });
        }

        const vendor = await Vendor.create({
            name: name.trim(),
            upi_id: upi_id?.trim() || null,
            bank_account: bank_account?.trim() || null,
            ifsc: ifsc?.trim().toUpperCase() || null,
            is_active: is_active !== undefined ? Boolean(is_active) : true
        });

        res.status(201).json({
            success: true,
            message: 'Vendor created successfully.',
            data: vendor
        });
    } catch (error) {
        console.error('Create vendor error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

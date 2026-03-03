const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: [true, 'Vendor is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    mode: {
        type: String,
        enum: { values: ['UPI', 'IMPS', 'NEFT'], message: 'Mode must be UPI, IMPS, or NEFT' },
        required: [true, 'Payment mode is required']
    },
    note: { type: String, trim: true, default: null },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
        default: 'Draft'
    },
    decision_reason: { type: String, trim: true, default: null },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);

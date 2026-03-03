const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vendor name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    upi_id: { type: String, trim: true, default: null },
    bank_account: { type: String, trim: true, default: null },
    ifsc: { type: String, trim: true, uppercase: true, default: null },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);

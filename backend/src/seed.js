const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('./models/User');
const Vendor = require('./models/Vendor');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing
        await User.deleteMany({});
        await Vendor.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users
        const users = await User.create([
            { email: 'ops@demo.com', password: 'ops123', role: 'OPS', name: 'Ops Manager' },
            { email: 'finance@demo.com', password: 'fin123', role: 'FINANCE', name: 'Finance Manager' }
        ]);
        console.log('👥 Users created:', users.map(u => `${u.email} [${u.role}]`));

        // Create vendors
        const vendors = await Vendor.create([
            { name: 'Tech Solutions Pvt Ltd', upi_id: 'techsolutions@paytm', bank_account: '1234567890', ifsc: 'HDFC0001234', is_active: true },
            { name: 'Digital Services Inc', upi_id: 'digitalservices@gpay', bank_account: '0987654321', ifsc: 'ICIC0005678', is_active: true },
            { name: 'Cloud Infra Ltd', upi_id: null, bank_account: '1122334455', ifsc: 'SBIN0009012', is_active: true },
            { name: 'Alpha Payments Corp', upi_id: 'alpha@phonepe', bank_account: '9988776655', ifsc: 'AXIS0003456', is_active: true },
            { name: 'Inactive Vendor Co', upi_id: 'inactive@upi', bank_account: null, ifsc: null, is_active: false }
        ]);
        console.log('🏪 Vendors created:', vendors.map(v => `${v.name} [active: ${v.is_active}]`));

        console.log('\n🎉 Seed completed successfully!\n');
        console.log('─────────────────────────────────────');
        console.log('📋 Login Credentials:');
        console.log('  OPS User     → ops@demo.com     / ops123');
        console.log('  FINANCE User → finance@demo.com / fin123');
        console.log('─────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedData();

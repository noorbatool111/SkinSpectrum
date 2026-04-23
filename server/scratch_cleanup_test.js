const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        await User.deleteOne({ email: 'test@example.com' });
        console.log('Test user deleted');
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

cleanup();

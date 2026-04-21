const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const User = require('./models/User');
        const users = await User.find({}).limit(5);
        console.log('Users found:', users.map(u => u.email));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkUsers();

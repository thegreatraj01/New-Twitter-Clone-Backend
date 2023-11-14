const mongoose = require('mongoose');

// Define the schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dateOfBirth: {
        type: Date
    },
    location: {
        type: String
    },
    profilePic: {
        type: String,
        default: "https://png.pngtree.com/png-vector/20221018/ourmid/pngtree-twitter-social-media-round-icon-png-image_6315985.png"
    }
}, {
    timestamps: true
});

// Create the model
const User = mongoose.model('User', UserSchema);

// Export the model
module.exports = User;


// timestamps: {
//     currentTime: () => {
//         let currentDate = new Date();
//         let offset = 330; // IST offset UTC +5:30 
//         let istDate = new Date(currentDate.getTime() + (offset * 60 * 1000));
//         return istDate;
//     }
// }

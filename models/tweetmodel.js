const mongoose = require('mongoose');

// Define the schema for the tweet model
const tweetSchema = new mongoose.Schema({
    content: { type: String, required: true },
    image: { type: String, default: "" },
    tweetedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        commentText: { type: String, required: true },
        commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        commentedAt: { type: Date, default: Date.now },
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
    }],
    retweetBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });

// Export the tweet model
const Tweets = mongoose.model('Tweets', tweetSchema);
module.exports = Tweets;
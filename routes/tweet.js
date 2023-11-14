const express = require('express');
const router = express.Router();
const user = require('../models/user_model');
const mongoose = require('mongoose');
const Tweets = require('../models/tweetmodel');
const verifyuser = require('../middleware/veryfyuser');

// ------------------------------------------------------------------------------------------------------
// create a new Tweet
router.post('/api/tweet', verifyuser, async (req, res) => {
    const { content } = req.body;
    try {
        if (!content) {
            return res.status(400).json({ error: "One or more mandatory fields are empty" });
        }
        const newTweet = new Tweets({ ...req.body, tweetedBy: req.user });
        // console.log("new tweet", newTweet);
        const savedTweet = await newTweet.save();
        // console.log('saved tweet', savedTweet);
        res.status(200).json({ massage: 'tweet added successfully', savedTweet: savedTweet });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

// ------------------------------------------------------------------------------------------------------

// Delete a tweet
router.delete('/api/deletetweet/:id', verifyuser, async (req, res) => {
    try {
        const { id } = req.params;
        const tweet = await Tweets.findById(id);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        if (tweet.tweetedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You do not have permission to delete this tweet' });
        }
        Tweets.deleteOne({ _id: id }).then((result) => {
            res.status(200).json({ message: 'Tweet deleted successfully' });
        }).catch((error) => {
            console.log(error);
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// ------------------------------------------------------------------------------------------------------

//all users tweets explore 
router.get("/api/exploretweet", async (req, res) => {
    try {

        const dbPosts = await Tweets.find().populate("tweetedBy", "_id name profilePic username").populate({
            path: "comments.commentedBy",
            model: "User",
            select: "_id name profilePic username", // Specify the fields you want to populate
        }).populate("retweetBy", "_id name username");

        res.status(200).json({ posts: dbPosts });
    } catch (error) {
        console.log(error);
    }
});


// ------------------------------------------------------------------------------------------------------
// timeline tweet and retweets 
router.get("/api/timelinetweets", verifyuser, async (req, res) => {
    try {
        const currentUser = await user.findById(req.user._id);

        // Get tweets of the current user's followers
        const followersTweets = await Tweets.find({ tweetedBy: { $in: currentUser.followers } }).populate("tweetedBy", "_id name profilePic username").populate({
            path: "comments.commentedBy",
            model: "User",
            select: "_id name profilePic username",
        }).populate("retweetBy", "_id name username");

        // Get tweets of users the current user is following
        const followingTweets = await Tweets.find({ tweetedBy: { $in: currentUser.following } }).populate("tweetedBy", "_id name profilePic username").populate({
            path: "comments.commentedBy",
            model: "User",
            select: "_id name profilePic username",
        }).populate("retweetBy", "_id name username");

        // // Get tweets that the current user has retweeted
        // const retweetedTweets = await Tweets.find({ retweetBy: req.user._id }).populate("tweetedBy", "_id name profilePic username").populate({
        //     path: "comments.commentedBy",
        //     model: "User",
        //     select: "_id name profilePic username",
        // }).populate("retweetBy", "_id name username");

        // Combine the follower's tweets and following tweets
        let timelineTweets = followersTweets.concat(followingTweets);

        // Use a Set to keep track of unique tweet IDs
        const uniqueTweetIds = new Set();

        // Filter out duplicate tweets based on their unique IDs
        timelineTweets = timelineTweets.filter((tweet) => {
            if (uniqueTweetIds.has(tweet._id.toString())) {
                return false; // Skip duplicate tweet
            }

            uniqueTweetIds.add(tweet._id.toString()); // Add tweet ID to the set
            return true; // Include unique tweet
        });

        res.status(200).json(timelineTweets);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});




// current user tweet and profile tweet 
router.get("/api/alltweetsbyuser/:id", verifyuser, async (req, res) => {
    try {
        const { id } = req.params;

        // Get retweeted tweets by the current user
        // const retweetedTweets = await Tweets.find({ retweetBy: id }).populate("tweetedBy", "_id name profilePic username").populate({
        //     path: "comments.commentedBy",
        //     model: "User",
        //     select: "_id name profilePic username", // Specify the fields you want to populate
        // });

        // Get tweets by the specified user
        const userTweets = await Tweets.find({ tweetedBy: id }).populate("tweetedBy", "_id name profilePic username").populate({
            path: "comments.commentedBy",
            model: "User",
            select: "_id name profilePic username", // Specify the fields you want to populate
        }).populate("retweetBy", "_id name username");

        // Merge retweetedTweets and userTweets into a single array
        // const allTweets = [...userTweets, ...retweetedTweets];
        const allTweets = userTweets

        res.status(200).json({ posts: allTweets });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// ---------------------------------------------------------------------------------------------------------

//api for like or disdike tweet both function in one api call
router.put("/api/like/dislike/:id", async (req, res) => {
    try {
        let userId = req.body.userid;
        // userId = userId.replace("ObjectId(\"", "").replace("\")", "");
        // console.log(req.body.userid);
        const tweet = await Tweets.findById(req.params.id);

        if (!tweet.likes.includes(userId)) {
            await tweet.updateOne({ $push: { likes: userId } });
            res.status(200).json("tweet has been liked");
        } else {
            await tweet.updateOne({ $pull: { likes: userId } });
            res.status(200).json("tweet has been disliked");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---------------------------------------------------------------------------------------------------------

// Add a comment to a tweet
router.put('/api/comment/:id', verifyuser, async (req, res) => {
    try {
        const { id } = req.params;
        // const commentText = req.body['commentText '];
        const commentText = req.body.commentText;
        // console.log(commentText,req.body,req.body.commentText);
        // console.log(req.body);
        // let commentedBy = req.user._id.toString().replace("ObjectId(\"", "").replace("\")", ""); 

        if (!commentText) {
            return res.status(400).json({ error: 'Content cannot be empty' });
        }
        const tweet = await Tweets.findById(id);
        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }
        tweet.comments.push({ commentText, commentedBy: req.user._id }); // Corrected line
        const updatedTweet = await tweet.save();

        res.status(200).json({ message: 'Comment added successfully', updatedTweet });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---------------------------------------------------------------------------------------------------------
// Retweet or undo retweet a tweet
router.put('/api/retweet/:id', verifyuser, async (req, res) => {
    try {
        const { id } = req.params;
        const tweet = await Tweets.findById(id);
        // console.log(id)

        if (String(tweet.tweetedBy) === String(req.user._id)) {
            return res.status(404).json({ error: 'you can not do that ' });
        }
        // Check if the user has already retweeted this tweet
        if (tweet.retweetBy.includes(req.user._id)) {
            // If yes, remove the user from the retweetBy array (undo retweet)
            tweet.retweetBy.pull(req.user._id);
            const updatedTweet = await tweet.save();
            return res.status(200).json({ message: 'Retweet undone successfully', updatedTweet });
        }
        // If not, add the user to the retweetBy array (retweet)
        tweet.retweetBy.push(req.user._id);
        const updatedTweet = await tweet.save();

        res.status(200).json({ message: 'Tweet retweeted successfully', updatedTweet });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---------------------------------------------------------------------------------------------------------

// get all retweetBy the user 

// router.get('/api/retweetbyuser', verifyuser, async (req, res) => {
//     try {

//         const retweetedTweets = await Tweets.find({ retweetBy: req.user._id });
//         if (!retweetedTweets) {
//             return res.status(404).json({ error: 'No retweeted tweets found for this user' });
//         }
//         res.status(200).json({ message: 'Retweeted tweets fetched successfully', retweetedTweets });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });
// ---------------------------------------------------------------------------------------------------------
// Define a route to delete a comment
router.delete('/api/tweet/:tweetId/comment/:commentId', verifyuser, async (req, res) => {
    try {
        const { tweetId, commentId } = req.params;

        // Ensure that the user has the necessary permissions to delete the comment
        const tweet = await Tweets.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }
        // Find the comment in the tweet's comments array
        const commentIndex = tweet.comments.findIndex((comment) => comment._id.toString() == commentId.toString());

        // const commentIndex = tweet.comments.findIndex(comment => comment._id == (commentId));
        if (commentIndex === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user trying to delete the comment is the one who created it
        if (!tweet.comments[commentIndex].commentedBy.equals(req.user._id)) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Remove the comment from the comments array
        tweet.comments.splice(commentIndex, 1);

        // Save the tweet with the comment removed
        await tweet.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
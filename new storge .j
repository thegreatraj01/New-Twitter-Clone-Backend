//all users tweets explore 
router.get("/api/exploretweet", verifyuser, async (req, res) => {
    try {
        const dbPosts = await Tweets.find().populate("tweetedBy", "_id name profilePic");
        res.status(200).json({ posts: dbPosts });
    } catch (error) {
        console.log(error);
    }
});


// ------------------------------------------------------------------------------------------------------

//all teeets only from logged in user
router.get("/api/myalltweet", verifyuser, async (req, res) => {
    try {
        const dbPosts = await Tweets.find({ tweetedBy: req.user._id }).populate("tweetedBy", "_id name profilePic");
        res.status(200).json({ posts: dbPosts });
    } catch (error) {
        console.log(error);
    }
});

// ---------------------------------------------------------------------------------------------------------

//api for like or disdike tweet both function in one api call
router.put("/api/like/dislike/:id", verifyuser, async (req, res) => {
    try {
        let userId = req.user._id.toString().replace("ObjectId(\"", "").replace("\")", ""); 
        // userId = userId.replace("ObjectId(\"", "").replace("\")", "");
        
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
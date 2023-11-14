const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const bcryptjs = require('bcrypt');
const verifyuser = require('../middleware/veryfyuser');


// -------------------------------------------------------------------------------------------------------
// for new user registration
router.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password } = req.body;
    // console.log(name, username, email, password);

    if (!name || !username || !email || !password) {
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    } else {
        try {
            const userInDb = await User.findOne({ email: email });
            const userInDb2 = await User.findOne({ username: username });

            if (userInDb || userInDb2) {
                return res.status(400).json({ error: 'user is already registered ' });
            } else {
                const hashedPassword = await bcryptjs.hash(password, 12);
                const newUser = new User({ name, username, password: hashedPassword, email });
                await newUser.save();
                res.status(201).json({ result: "User Signed up Successfully!" });
            }
        } catch (error) {
            console.log(error);
        }
    }
});

// --------------------------------------------------------------------------------------------------------

// for user logiin 
router.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    } else {
        try {
            const userInDb = await User.findOne({ email: email });
            if (userInDb) {
                const compare = await bcryptjs.compare(password, userInDb.password);
                // console.log(compare);

                if (compare) {
                    const newJwtToken = await jwt.sign({ _id: userInDb._id }, process.env.JWT_SECRET);
                    const { password, ...userInfo } = userInDb._doc
                    return res.json({ result: { token: newJwtToken, user: userInfo } });
                } else {
                    res.status(401).json({ message: 'wrong password ' });
                }

            } else {
                res.status(401).json({ message: 'user is not registered' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
});


// ----------------------------------------------------------------------------------------
// for getting a single user from the database
router.get('/api/profile/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "User ID is required" });
    } else {
        try {
            const userInDb = await User.findById(id);
            if (userInDb) {
                const { password, ...userInfo } = userInDb._doc;
                return res.json({ result: userInfo });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
});

// -----------------------------------------------------------------------------------------------------
// for update a user in the database
router.put('/api/auth/updateuser', verifyuser, async (req, res) => {
    const id = req.user._id;
    const { name, location, dateOfBirth } = req.body;
    
    if (!name || !location || !dateOfBirth) {
        return res.status(400).json({ error: "All feilds all required" });
    } else {
        try {
            const userInDb = await User.findById(id);

            if (userInDb) {
                if (name) userInDb.name = name;
                if (location) userInDb.location = location;
                if (dateOfBirth) userInDb.dateOfBirth = dateOfBirth;

                await userInDb.save();

                // Destructure password from userInDb before sending response
                const { password, ...userInfo } = userInDb._doc;

                return res.json({ result: userInfo });
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Something went wrong' });
        }
    }
});

// -----------------------------------------------------------------------------------------------------

// Route to update profile picture
router.put('/api/update/profile-pic', verifyuser, async (req, res) => {
    // console.log('API call for updating profile picture');
    const userId = req.user._id;
    const { profilePic } = req.body;


    try {
        if (!profilePic) {
            return res.status(400).json({ error: 'Profile picture is required' });
        }

        // Find the user by ID and update the profilePic field
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePic } },
            { new: true } // Return the updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/hi', (req, res) => {
    res.json({ "kaisa hai re ahu ": "jojojoj" })
}
)
// -----------------------------------------------------------------------------------------------------
// follow unfollow user 

router.put('/api/follow/unfollow/:userId', verifyuser, async (req, res) => {
    try {
        const { userId } = req.params;

        const userToFollow = await User.findById(userId);
        // console.log('userToFollow', userToFollow);

        currentuser = await User.findById(req.user._id);
        // console.log('currentuser', currentuser);



        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (userToFollow.followers.includes(req.user._id)) {
            userToFollow.followers.pull(req.user._id);
            currentuser.following.pull(userId);
            await userToFollow.save();
            await currentuser.save();
            return res.status(200).json({ message: 'User unfollowed successfully' });
        } else {
            userToFollow.followers.push(req.user._id);
            currentuser.following.push(userId);
            await userToFollow.save();
            await currentuser.save();
            return res.status(200).json({ message: 'User followed successfully' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;

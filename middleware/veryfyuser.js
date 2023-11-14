const jwt = require('jsonwebtoken');
const user = require('../models/user_model');
const bcryptjs = require('bcrypt');

const verifyuser = async (req, res, next) => {
    const { authorization } = req.headers;
   
    if (!authorization) {
        res.status(401).json({ message: "user not logged in 1 " });
    } else {
        try {
            const token = authorization;
            // console.log(token);//ityukkj==--0ukly=09hjkfhkhjkhjk---------------------------
            const payload = await jwt.verify(token, process.env.JWT_SECRET);
            const { _id } = payload;
            const dbUser = await user.findById(_id);
            if (!dbUser) {
                return res.status(401).json({ message: "user not logged in" });
            }
            const { password, ...returnuser } = dbUser._doc;
            // console.log('dbuser',dbUser);
            // console.log('returnuser',returnuser);
            req.user = returnuser;
            // console.log(req.user);

            next();//goes to the next middleware or goes to the REST API
        } catch (error) {
            console.log(error)
        }

    }
}

module.exports = verifyuser;

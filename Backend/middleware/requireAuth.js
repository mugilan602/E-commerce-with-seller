const jwt = require('jsonwebtoken');
const User = require("../model/users");

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "Authorization token required" });
    }

    // Token usually comes as "Bearer <token>", so split by space
    const token = authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Authorization token required" });
    }

    try {
        // Verify the token using the secret from environment variables
        const { _id } = jwt.verify(token, process.env.SECRET);

        // Find the user by _id and attach it to the request object
        req.user = await User.findOne({ _id }).select("_id");

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Request is not authorized' });
    }
};

module.exports = requireAuth;

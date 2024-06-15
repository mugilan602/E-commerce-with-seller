const jwt = require('jsonwebtoken');
const Seller = require('../model/Seller');

const requireSellerAuth = async (req, res, next) => {
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

        // Find the seller by _id and attach it to the request object
        req.user = await Seller.findOne({ _id }).select("_id role email");

        // Check if the user is a seller
        if (req.user.role !== 'seller') {
            return res.status(403).json({ error: 'Access denied: Not a seller' });
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Request is not authorized' });
    }
};

module.exports = requireSellerAuth;

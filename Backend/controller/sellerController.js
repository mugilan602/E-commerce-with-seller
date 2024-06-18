const Seller = require('../model/Seller');
const Product = require('../model/products');
const User=require("../model/users")
const mongoose=require("mongoose")
const jwt = require('jsonwebtoken')
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "2d" });
};
// Create a new product for a seller
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Seller.login(email, password);
        const token = createToken(user._id);
        res.status(200).json({
            email: user.email,
            token,
            role: user.role,
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Seller.signup(email, password);
        const token = createToken(user._id);
        res.status(200).json({ email, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
const getCustomers = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid productId format" });
    }

    try {
        // Ensure user is authenticated and a seller
        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(401).json({ error: 'Unauthorized: Seller not found' });
        }

        // Find the seller and populate products array to get buyerIds
        const sellerWithProducts = await Seller.findById(req.user._id)
            .populate({
                path: 'products',
                match: { _id: productId },
                populate: { path: 'buyerIds', select: 'email' }
            })
            .select('products');

        if (!sellerWithProducts) {
            return res.status(404).json({ error: 'Seller or product not found' });
        }

        // Extract the product with the specific productId
        const product = sellerWithProducts.products.find(p => p.productId && p.productId._id.toString() === productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product.buyerIds); // Return the buyerIds for the specific product
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(400).json({ error: error.message });
    }
};




const getProducts = async (req, res) => {
    try {
        // Ensure user is authenticated and a seller
        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(401).json({ error: 'Unauthorized: Seller not found' });
        }

        // Fetch all products associated with the seller
        const products = await Product.find({ sellerId: seller._id });

        if (!products) {
            return res.status(404).json({ error: 'Products not found' });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const createProducts = async (req, res) => {
    const { name, price, image_url, category } = req.body;

    try {
        // Ensure user is authenticated and a seller
        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(401).json({ error: 'Unauthorized: Seller not found' });
        }

        const product = new Product({ name, price, image_url, category, sellerId: seller._id });
        await product.save();

        // Update the seller's products array with the new structure
        seller.products.push({ productId: product._id, buyerIds: [] });
        await seller.save();

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update an existing product
const updateProducts = async (req, res) => {
    const { id } = req.params;
    const { name, price, image_url, category } = req.body;

    try {
        // Ensure user is authenticated and a seller
        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(401).json({ error: 'Unauthorized: Seller not found' });
        }

        const product = await Product.findByIdAndUpdate(id, { name, price, image_url, category }, { new: true });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a product
const deleteProducts = async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure user is authenticated and a seller
        const seller = await Seller.findById(req.user._id);
        if (!seller) {
            return res.status(401).json({ error: 'Unauthorized: Seller not found' });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Remove product ID from seller's products array
        seller.products = seller.products.filter(prodId => prodId.toString() !== id);
        await seller.save();

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createProducts, updateProducts, deleteProducts, login, signup,getProducts ,getCustomers};

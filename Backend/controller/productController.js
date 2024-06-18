const Product = require("../model/products");
const Seller=require("../model/Seller")
const Cart=require("../model/Cart")
const mongoose=require("mongoose")
const getProducts = async (req, res) => {
    const { category } = req.query;
    console.log(req.query);
    let products;
    try {
        if (category) {
            products = await Product.find({ category });
        } else {
            products = await Product.find();
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const buy = async (req, res) => {
    const userId = req.user._id; // Assuming user ID is available in req.user
    const { productId } = req.body; // Assuming productId is sent in the request body

    console.log("userId:", userId);
    console.log("productId:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid productId format" });
    }

    try {
        // Find the product by productId
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Find the seller and update the buyerIds array for the specified product
        const seller = await Seller.findOneAndUpdate(
            { _id: product.sellerId, 'products.productId': productId },
            { $addToSet: { 'products.$.buyerIds': userId } },
            { new: true }
        );

        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        res.status(200).json({ message: "Product bought successfully" });
    } catch (error) {
        console.error("Error buying product:", error);
        res.status(400).json({ error: error.message });
    }
};
const addToCart = async (req, res) => {
    const userId = req.user._id; // Assuming user ID is available in req.user
    const { productId } = req.body; // Assuming productId is sent in the request body

    console.log("userId:", userId);
    console.log("productId:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid productId format" });
    }

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // If cart doesn't exist, create a new one
            cart = new Cart({ userId, items: [] });
        }

        // Check if the product is already in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

        if (itemIndex !== -1) {
            // Increment quantity if product exists in the cart
            cart.items[itemIndex].quantity++;
        } else {
            // Add new item to the cart
            cart.items.push({ productId, quantity: 1 });
        }

        // Save the cart and populate product details before sending response
        await cart.save();
        await cart.populate('items.productId');

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(400).json({ error: error.message });
    }
};

const updateCart = async (req, res) => {
    const userId = req.user._id; // Assuming user ID is available in req.user
    const { productId, newQuantity } = req.body; // Assuming productId and newQuantity are sent in the request body
  
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId format' });
    }
  
    try {
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      const item = cart.items.find((item) => item.productId.equals(productId));
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
  
      item.quantity = newQuantity;
      await cart.save();
      await cart.populate('items.productId')
  
      res.status(200).json(cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(400).json({ error: error.message });
    }
  };

const getCart = async (req, res) => {
    const userId = req.user._id; // Assuming user ID is available in req.user

    try {
        // Find the user's cart and populate the products
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getLatestProducts = async (req, res) => {
    try {
        const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(8);
        res.status(200).json(latestProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest products' });
    }
};

const createProducts = async (req, res) => {
    const { name, price, image_url, category } = req.body;
    const sellerId = req.user._id; // Assuming seller's ID is available in req.user

    try {
        const product = await Product.create({ name, price, image_url, category, sellerId });
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateProducts = async (req, res) => {
    // Implementation here
};

const deleteProducts = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getProducts, createProducts, updateProducts, deleteProducts,getLatestProducts,addToCart,getCart,updateCart,buy };

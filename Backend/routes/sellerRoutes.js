const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireSellerAuth');
const { createProducts, updateProducts, deleteProducts,login,signup,getProducts } = require('../controller/sellerController');


//login
router.post('/login', login);

//signup
router.post('/signup', signup);


router.use(requireAuth);
// Create a new product
router.post('/create', createProducts);
//get products
router.get("/getProducts",getProducts)
// Update an existing product
router.put('/:id',  updateProducts);

// Delete a product
router.delete('/:id', deleteProducts);

module.exports = router;

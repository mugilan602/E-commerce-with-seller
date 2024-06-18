const express = require('express');
const router = express.Router();
const { getProducts, createProducts, updateProducts, deleteProducts, getLatestProducts, addToCart ,getCart,updateCart,buy} = require('../controller/productController');
const requireAuth = require('../middleware/requireAuth');
//home
router.get('/latest', getLatestProducts);
router.get('/', getProducts);

router.use(requireAuth);
//cart
router.get("/getCart",getCart)
router.post('/cart', addToCart);
router.patch("/cart",updateCart)
//buy
router.post('/buy', buy);


module.exports = router;

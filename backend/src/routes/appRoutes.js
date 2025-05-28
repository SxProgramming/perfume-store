const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');

router.get('/categories', appController.getAllCategories);
router.get('/products', appController.getAllProducts);
router.get('/products/category/:categorySlug', appController.getProductsByCategorySlug);
router.post('/subscribe', appController.handleSubscription); // Nueva ruta

module.exports = router;
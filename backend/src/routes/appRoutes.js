const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');

router.get('/categories', appController.getAllCategories);
router.get('/products', appController.getAllProducts); // Ruta para todos los productos (para "Destacados")
router.get('/products/category/:categorySlug', appController.getProductsByCategorySlug);

module.exports = router;
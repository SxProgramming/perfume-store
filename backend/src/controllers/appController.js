const pool = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT id, name, slug, description, image_url FROM categories ORDER BY id ASC');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error del servidor al obtener categorías.', error: error.message });
    }
};

exports.getProductsByCategorySlug = async (req, res) => {
    try {
        const { categorySlug } = req.params;
        const query = `
            SELECT p.id, p.name, p.brand, p.description, p.price, p.image_url, p.sku, p.tags, p.stock
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE c.slug = ?
            ORDER BY p.name ASC;
        `;
        const [products] = await pool.query(query, [categorySlug]);
        if (products.length === 0) {
            // No es un error si una categoría no tiene productos todavía
            return res.json([]);
        }
        res.json(products);
    } catch (error) {
        console.error(`Error fetching products for category ${req.params.categorySlug}:`, error);
        res.status(500).json({ message: 'Error del servidor al obtener productos por categoría.', error: error.message });
    }
};

exports.getAllProducts = async (req, res) => { // Para la sección "Destacados", por ejemplo
    try {
        const query = `
            SELECT p.id, p.name, p.brand, p.description, p.price, p.image_url, p.sku, p.tags, p.stock,
                   c.name as category_name, c.slug as category_slug
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC;
        `;
        const [products] = await pool.query(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Error del servidor al obtener todos los productos.', error: error.message });
    }
};
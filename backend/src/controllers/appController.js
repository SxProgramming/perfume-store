const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Configuración de Nodemailer (usará variables de entorno)
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // A menudo necesario para localhost o ciertos proveedores
        }
    });

    transporter.verify(function(error, success) { // Verificar configuración del transporter
        if (error) {
            console.warn("🔴 Nodemailer transporter config error:", error.message);
            console.warn("➡️ Emails might not be sent. Check EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE in .env");
            console.warn("➡️ For Gmail, ensure 'Less secure app access' is ON or use App Passwords if 2FA is enabled.");
            transporter = null; // Desactivar si hay error
        } else {
            console.log("✅ Nodemailer transporter is ready to send emails.");
        }
    });

} else {
    console.warn("⚠️ EMAIL_USER o EMAIL_PASS no definidos en .env. El envío de correos estará deshabilitado/simulado.");
    transporter = null;
}


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
        res.json(products); // Devuelve array vacío si no hay productos, lo cual es correcto
    } catch (error) {
        console.error(`Error fetching products for category ${req.params.categorySlug}:`, error);
        res.status(500).json({ message: 'Error del servidor al obtener productos por categoría.', error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.name, p.brand, p.description, p.price, p.image_url, p.sku, p.tags, p.stock,
                   c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id -- LEFT JOIN para no perder productos sin categoría
            ORDER BY p.created_at DESC;
        `;
        const [products] = await pool.query(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Error del servidor al obtener todos los productos.', error: error.message });
    }
};

exports.handleSubscription = async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Validación básica de email
        return res.status(400).json({ success: false, message: 'Por favor, proporciona un correo electrónico válido.' });
    }

    // Opcional: Guardar email en una tabla 'subscribers' en la BD
    // try {
    //     await pool.query('INSERT INTO subscribers (email) VALUES (?)', [email]);
    // } catch (dbError) {
    //     if (dbError.code === 'ER_DUP_ENTRY') {
    //         // Email ya suscrito, podrías considerarlo un éxito o un mensaje diferente
    //         console.log(`Email ${email} ya está suscrito.`);
    //     } else {
    //         console.error('Error guardando suscriptor en BD:', dbError);
    //         // No fallar la operación completa si solo falla el guardado en BD pero el correo se puede enviar
    //     }
    // }

    const fromName = process.env.EMAIL_FROM_NAME || "Aura Perfumería";
    const mailOptions = {
        from: `"${fromName}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '¡Gracias por suscribirte a Aura Perfumería!',
        html: `
            <div style="font-family: Montserrat, Arial, sans-serif; color: #3D3537; line-height: 1.6; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0d8d5; border-radius: 8px; background-color: #FDFBF9;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-family: 'Playfair Display', serif; color: #8A5A64; font-size: 28px; margin:0;">AURA</h1>
                    <p style="font-size: 14px; color: #C08497;">Perfumería</p>
                </div>
                <h2 style="font-family: 'Playfair Display', serif; color: #8A5A64; font-size: 22px; text-align: center;">¡Bienvenido/a a la comunidad Aura!</h2>
                <p style="font-size: 16px; margin-bottom: 15px;">Hola,</p>
                <p style="font-size: 16px; margin-bottom: 15px;">Gracias por unirte a nuestro exclusivo círculo de amantes de las fragancias. En Aura Perfumería, cada esencia cuenta una historia, y estamos emocionados de que comiences a descubrir la tuya con nosotros.</p>
                <p style="font-size: 16px; margin-bottom: 15px;">Prepárate para recibir noticias sobre nuestros últimos lanzamientos, colecciones de edición limitada, eventos privados y el arte detrás de cada creación olfativa.</p>
                <p style="font-size: 16px; margin-bottom: 25px;">Tu viaje sensorial comienza ahora.</p>
                <div style="text-align: center; margin-bottom: 25px;">
                    <a href="${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}" target="_blank" style="background-color: #8A5A64; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block;">Explorar la Tienda</a>
                </div>
                <p style="font-size: 16px; margin-bottom: 5px;">Con cariño,<br>El equipo de Aura Perfumería</p>
                <hr style="border: none; border-top: 1px solid #e0d8d5; margin: 20px 0;">
                <p style="font-size: 12px; text-align: center; color: #888;">Si no te suscribiste, puedes ignorar este correo de forma segura.</p>
            </div>
        `
    };

    if (!transporter) {
        console.warn(`Simulando envío de correo de suscripción a: ${email} (Nodemailer no configurado/falló la verificación)`);
        // Simulación para desarrollo si no hay credenciales o falló la verificación
        return res.status(200).json({ success: true, message: '¡Suscripción exitosa! (Correo simulado). Revisa tu bandeja de entrada.' });
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de suscripción enviado exitosamente a: ${email}`);
        res.status(200).json({ success: true, message: '¡Suscripción exitosa! Revisa tu correo para nuestra bienvenida.' });
    } catch (error) {
        console.error('Error al enviar correo de suscripción con Nodemailer:', error);
        res.status(500).json({ success: false, message: 'Hubo un problema al enviar el correo de bienvenida. Por favor, inténtalo más tarde o contacta a soporte.' });
    }
};
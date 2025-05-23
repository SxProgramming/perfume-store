CREATE DATABASE IF NOT EXISTS aura_perfumeria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aura_perfumeria_db;

-- Desactivar temporalmente las restricciones de clave externa para evitar problemas de orden de creación
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 10, -- Asumimos un stock inicial
    image_url VARCHAR(255) NOT NULL, -- Ruta relativa a frontend/images/
    sku VARCHAR(50) UNIQUE NOT NULL,
    tags VARCHAR(255), -- ej: "Nuevo,Más Vendido,Floral"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactivar las restricciones de clave externa
SET FOREIGN_KEY_CHECKS=1;

-- Datos de ejemplo
INSERT INTO categories (name, slug, description, image_url) VALUES
('Esencias Femeninas', 'esencias-femeninas', 'Fragancias que celebran la gracia y el poder interior.', 'images/category-femenino.jpg'),
('Aromas Masculinos', 'aromas-masculinos', 'Notas audaces para el hombre contemporáneo y carismático.', 'images/category-masculino.jpg'),
('Firmas Unisex', 'firmas-unisex', 'Esencias versátiles que desafían convenciones y unen mundos.', 'images/category-unisex.jpg');

INSERT INTO products (category_id, name, brand, description, price, image_url, sku, tags) VALUES
(1, 'Éclat Nocturne', 'Maison de Aura', 'Una fragancia misteriosa y seductora para la noche. Notas de jazmín, ámbar y sándalo.', 185.00, 'images/perfume1.png', 'AURA-EN-001', 'Nuevo,Oriental,Seductor'),
(1, 'Rosa Éternelle', 'Maison de Aura', 'Un clásico floral reinventado, elegante y atemporal. Corazón de rosa de mayo y peonía.', 190.00, 'images/perfume-fem-1.png', 'AURA-RE-002', 'Floral,Clásico'),
(1, 'Fleur de Lune', 'Jardins Secrets', 'Un bouquet luminoso y delicado con toques de nardo y gardenia blanca.', 175.00, 'images/perfume2.png', 'JDS-FL-003', 'Floral,Luminoso'),

(2, 'Bois Intense', 'Artisan Parfums', 'Un aroma amaderado profundo y especiado con un toque de vetiver y cuero.', 210.00, 'images/perfume-masc-1.png', 'ARTP-BI-001', 'Más Vendido,Amaderado,Intenso'),
(2, 'Acier Frais', 'Urban Essence', 'Una fragancia vibrante y metálica con notas cítricas y acuáticas.', 160.00, 'images/perfume3.png', 'URBE-AF-002', 'Fresco,Metálico'),

(3, 'Ambre Mystique', 'Atelier Naturel', 'Un ámbar cálido y envolvente con matices de incienso y vainilla negra.', 195.00, 'images/perfume-unisex-1.png', 'ATLN-AM-001', 'Unisex,Ámbar,Misterioso'),
(3, 'Thé Vert Impérial', 'Les Essences Rares', 'La pureza refrescante del té verde sencha con un toque de bergamota y jazmín.', 170.00, 'images/perfume-unisex-2.png', 'LSER-TVI-002', 'Unisex,Fresco,Té Verde');

-- Nota: Crea imágenes placeholder si no las tienes:
-- perfume-fem-1.png, perfume-masc-1.png, perfume-unisex-1.png, perfume-unisex-2.png
-- en tu carpeta frontend/images/
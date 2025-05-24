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
(1, 'Eclaire', 'Lattafa', 'Una fragancia misteriosa y seductora para la noche. Notas de caramelo, flores blancas, vainilla y almizcle.', 340.000, 'images/perfume1.png', 'AURA-EN-001', 'Nuevo,Oriental,Seductor'),
(1, 'Honor and Glory', 'Lattafa', 'Un gourdmand, elegante y atemporal. Corazón piña, créme brulée, ademas de canela y vainilla.', 245.000, 'images/perfume2.png', 'AURA-RE-002', 'Frutal,Clásico'),
(1, 'Delina Exclusif', 'Parfums de Marly', 'Un oriental luminoso y delicado con toques de lichi, pera, bergamota, oud y rosa turca.', 1250.000, 'images/perfume4.png', 'JDS-FL-003', 'Oriental,Luminoso'),

(2, 'Valentino Uomo', 'Valentino', 'Un aroma amaderado profundo y especiado con un toque de notas minerales, violeta, sal y vetiver.', 600.00, 'images/perfume5.png', 'ARTP-BI-001', 'Más Vendido,Amaderado,Intenso'),
(2, 'Imagination', 'Louis vuitton', 'Una fragancia vibrante y metálica con notas cítricas y acuáticas.', 1750.00, 'images/perfume3.png', 'URBE-AF-002', 'Fresco,Metálico'),

(3, 'Stallion 53', 'Emper', 'Un ámbar cálido y envolvente con matices amaderadas, de cardamomo, sándalo y curo.', 235.00, 'images/perfume6.png', 'ATLN-AM-001', 'Unisex,Iris,Misterioso'),
(3, 'Khamrah', 'Lattafa', 'El dulce especiado de la canela, la nuez moscada con un toque de dátiles, praliné y haba tonka.', 270.00, 'images/perfume7.png', 'LSER-TVI-002', 'Unisex,Fresco,Té Verde');


-- Nota: Crea imágenes placeholder si no las tienes:
-- perfume-fem-1.png, perfume-masc-1.png, perfume-unisex-1.png, perfume-unisex-2.png
-- en tu carpeta frontend/images/
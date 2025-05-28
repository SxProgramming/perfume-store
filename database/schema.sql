CREATE DATABASE IF NOT EXISTS aura_perfumeria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aura_perfumeria_db;

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
    stock INT DEFAULT 10,
    image_url VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;

INSERT INTO categories (name, slug, description, image_url) VALUES
('Esencias Femeninas', 'esencias-femeninas', 'Fragancias que celebran la gracia y el poder interior.', 'images/category-femenino.jpg'),
('Aromas Masculinos', 'aromas-masculinos', 'Notas audaces para el hombre contemporáneo y carismático.', 'images/category-masculino.jpg'),
('Firmas Unisex', 'firmas-unisex', 'Esencias versátiles que desafían convenciones y unen mundos.', 'images/category-unisex.jpg');

-- Esencias Femeninas (Total 9)
INSERT INTO products (category_id, name, brand, description, price, image_url, sku, tags) VALUES
(1, 'Éclat Nocturne', 'Maison de Aura', 'Una fragancia misteriosa y seductora para la noche. Notas de jazmín, ámbar y sándalo.', 185.00, 'images/perfume1.png', 'AURA-EN-001', 'Nuevo,Oriental,Seductor'),
(1, 'Rosa Éternelle', 'Maison de Aura', 'Un clásico floral reinventado, elegante y atemporal. Corazón de rosa de mayo y peonía.', 190.00, 'images/perfume1.png', 'AURA-RE-002', 'Floral,Clásico'),
(1, 'Fleur de Lune', 'Jardins Secrets', 'Un bouquet luminoso y delicado con toques de nardo y gardenia blanca.', 175.00, 'images/perfume2.png', 'JDS-FL-003', 'Floral,Luminoso'),
(1, 'Jardin Secret', 'Fleurs de Paris', 'Un jardín secreto de flores blancas y frutas delicadas, evocando un paseo parisino.', 165.00, 'images/perfume2.png', 'FDP-JS-004', 'Floral,Frutal'),
(1, 'Nuit de Velours', 'Parfums de Niche', 'Terciopelo líquido de iris, violeta y maderas preciosas, para una noche inolvidable.', 220.00, 'images/perfume2.png', 'PDN-NV-005', 'Atalcado,Amaderado,Noche'),
(1, 'Aube Dorée', 'Soleil Levant', 'Un amanecer radiante con notas de cítricos italianos y almizcle blanco puro.', 150.00, 'images/perfume2.png', 'SOL-AD-006', 'Cítrico,Fresco,Día'),
(1, 'Mystère Ambré', 'Orient Express', 'Un viaje exótico con ámbar cálido, especias de oriente y un toque sutil de oud.', 205.00, 'images/perfume2.png', 'ORE-MA-007', 'Oriental,Ámbar,Especiado'),
(1, 'Perle de Mer', 'Aqua Vitae', 'La frescura de la brisa marina capturada con sal, algas y maderas flotantes.', 170.00, 'images/perfume2.png', 'AQV-PM-008', 'Acuático,Marino,Fresco'),
(1, 'Songe Poudré', 'Rêverie Parfums', 'Un sueño empolvado de heliotropo, almendra dulce y vainilla suave y reconfortante.', 180.00, 'images/perfume2.png', 'RVP-SP-009', 'Gourmand,Atalcado');

-- Aromas Masculinos (Total 9)
INSERT INTO products (category_id, name, brand, description, price, image_url, sku, tags) VALUES
(2, 'Bois Intense', 'Artisan Parfums', 'Un aroma amaderado profundo y especiado con un toque de vetiver y cuero.', 210.00, 'images/perfume2.png', 'ARTP-BI-001', 'Más Vendido,Amaderado,Intenso'),
(2, 'Acier Frais', 'Urban Essence', 'Una fragancia vibrante y metálica con notas cítricas y acuáticas para el hombre moderno.', 160.00, 'images/perfume2.png', 'URBE-AF-002', 'Fresco,Metálico'),
(2, 'Cuir Nomade', 'Voyageur Parfums', 'La esencia del aventurero: cuero robusto, tabaco y especias de ruta exótica.', 230.00, 'images/perfume2.png', 'VYG-CN-003', 'Cuero,Tabaco,Especiado'),
(2, 'Forêt Profonde', 'Esprits Sauvages', 'La inmensidad del bosque con pino, musgo de roble y tierra húmeda y misteriosa.', 190.00, 'images/perfume2.png', 'ESV-FP-004', 'Amaderado,Verde,Tierra'),
(2, 'Vent d''Est', 'Horizons Lointains', 'Un viento especiado del este con cardamomo, azafrán y sándalo cremoso.', 200.00, 'images/perfume2.png', 'HLT-VE-005', 'Oriental,Especiado,Exótico'),
(2, 'Roche Volcanique', 'Terra Firma', 'La fuerza de la tierra: notas minerales, incienso y pachulí terroso y vibrante.', 215.00, 'images/perfume2.png', 'TRF-RV-006', 'Mineral,Tierra,Incienso'),
(2, 'Océan Infini', 'Abysses Marines', 'La profundidad del océano con ámbar gris, sal marina y notas acuáticas intensas.', 195.00, 'images/perfume2.png', 'ABM-OI-007', 'Acuático,Marino,Intenso'),
(2, 'Citron Noir', 'Agrumes Exquis', 'Un cítrico oscuro y sofisticado con limón negro persa, pimienta y maderas ahumadas.', 175.00, 'images/perfume2.png', 'AGX-CN-008', 'Cítrico,Ahumado,Sofisticado'),
(2, 'Tabac Royal', 'Héritage Collection', 'Opulencia y tradición: tabaco dulce cubano, vainilla bourbon y haba tonka rica.', 240.00, 'images/perfume2.png', 'HRC-TR-009', 'Gourmand,Tabaco,Lujo');

-- Firmas Unisex (Total 9)
INSERT INTO products (category_id, name, brand, description, price, image_url, sku, tags) VALUES
(3, 'Ambre Mystique', 'Atelier Naturel', 'Un ámbar cálido y envolvente con matices de incienso y vainilla negra de Madagascar.', 195.00, 'images/perfume2.png', 'ATLN-AM-001', 'Unisex,Ámbar,Misterioso'),
(3, 'Thé Vert Impérial', 'Les Essences Rares', 'La pureza refrescante del té verde sencha con un toque de bergamota de Calabria y jazmín sambac.', 170.00, 'images/perfume2.png', 'LSER-TVI-002', 'Unisex,Fresco,Té Verde'),
(3, 'Palo Santo Sacré', 'Rituels Anciens', 'Madera sagrada de Palo Santo con incienso, mirra y un toque cítrico revitalizante.', 185.00, 'images/perfume2.png', 'RAN-PSS-003', 'Amaderado,Incienso,Espiritual'),
(3, 'Fève Tonka Céleste', 'Étoiles Filantes', 'Haba tonka cremosa con almendra, lavanda de Provenza y un susurro de anís estrellado.', 200.00, 'images/perfume2.png', 'ETF-FTC-004', 'Gourmand,Aromático,Cálido'),
(3, 'Musc Blanc Pur', 'Peau Neuve', 'La pureza del almizcle blanco, limpio, suave y reconfortante como una segunda piel.', 160.00, 'images/perfume2.png', 'PNV-MBP-005', 'Almizcle,Limpio,Suave'),
(3, 'Vétiver Fumé', 'Terres Lointaines', 'Vetiver ahumado de Haití, con notas de cipriol terroso y maderas oscuras profundas.', 210.00, 'images/perfume2.png', 'TRL-VF-006', 'Amaderado,Ahumado,Tierra'),
(3, 'Gingembre Éclatant', 'Épices Vibrantes', 'Jengibre fresco y picante de la India, realzado con lima kaffir y cardamomo verde.', 175.00, 'images/perfume2.png', 'EPV-GE-007', 'Especiado,Fresco,Vibrante'),
(3, 'Santal Crémieux', 'Bois Précieux', 'Sándalo australiano cremoso y lechoso, con higo dulce y un toque de coco tropical.', 225.00, 'images/perfume2.png', 'BOP-SC-008', 'Amaderado,Cremoso,Lactónico'),
(3, 'Papyrus Ancien', 'Bibliothèque Olfactive', 'El aroma seco y ligeramente dulce del papiro antiguo, con cedro de Virginia y un toque de cuero fino.', 190.00, 'images/perfume2.png', 'BIO-PA-009', 'Amaderado,Seco,Intelectual');
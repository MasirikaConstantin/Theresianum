CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `duree_minutes` int(11) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `ref` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `services` (`id`, `name`, `description`, `duree_minutes`, `prix`, `actif`, `ref`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Bel_374b9', 'serv-0001', 'Soin de visage', './img/services/serv-0001.jpg', 1, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(2, 'Bel_374b9', 'serv-0002', 'Maquillage', './img/services/serv-0002.jpg', 2, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(3, 'Bel_374b9', 'serv-0003', 'Soin du corps', './img/services/serv-0003.jpg', 3, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(4, 'Bel_374b9', 'serv-0004', 'Pose cils ', './img/services/serv-0004.jpg', 4, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(5, 'Bel_374b9', 'serv-0005', 'Pose perruque', './img/services/serv-0005.jpg', 5, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(6, 'Bel_374b9', 'serv-0006', 'Tissage normal', './img/services/serv-0006.jpg', 6, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(7, 'Bel_374b9', 'serv-0007', 'Manucure', './img/services/serv-0007.jpg', 7, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(8, 'Bel_374b9', 'serv-0008', 'Pedicure', './img/services/serv-0008.jpg', 8, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(9, 'Bel_374b9', 'serv-0009', 'Service ongles', './img/services/serv-0009.jpg', 9, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(10, 'Bel_374b9', 'serv-0010', 'Maquillage permanant', './img/services/serv-0010.jpg', 10, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(11, 'Bel_374b9', 'pack-001', 'NAILS', '', 1, 0, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(12, 'Bel_374b9', 'pack-002', 'SOINS', '', 2, 0, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(13, 'Bel_374b9', 'pack-003', 'BEAUTY', '', 3, 0, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(14, 'Bel_374b9', 'pack-004', 'MARIAGE', '', 4, 0, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(15, 'Bel_374b9', 'serv-0011', 'Gel services', './img/services/serv-0011.jpg', 11, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(16, 'Bel_374b9', 'serv-0012', 'Pieds nails ', './img/services/serv-0012.jpg', 12, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(17, 'Bel_374b9', 'serv-0013', 'Service Mariée ', './img/services/serv-0013.jpg', 13, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(18, 'Bel_374b9', 'serv-0014', 'Acrylique services', './img/services/serv-0014.jpeg', 14, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(19, 'Bel_374b9', 'serv-0015', 'Produits pose parfait', './img/services/serv-0015.jpg', 15, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(20, 'Bel_374b9', 'serv-0016', 'Services tresses', './img/services/serv-0016.jpg', 16, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(21, 'Bel_374b9', 'serv-0017', 'Décoloration cheveux naturel', './img/services/serv-0015.png', 17, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(22, 'Bel_374b9', 'serv-0018', 'Décoloration perruque', './img/services/serv-0018.jpg', 18, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(23, 'Bel_374b9', 'serv-0019', 'Autres services', './img/services/serv-0015.png', 19, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(24, 'Bel_374b9', 'serv-0020', 'Coupe pixi', './img/services/serv-0020.jpg', 20, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001'),
(25, 'Bel_374b9', 'serv-0021', 'Ponytail', './img/services/serv-0021.jpg', 21, 1, 'en cours', '03-08-2024', 'gloryfung620@gmail.com', '0000000000010001');

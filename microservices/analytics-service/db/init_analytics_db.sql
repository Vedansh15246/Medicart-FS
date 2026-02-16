USE analytics_db;-- Analytics and Reports Database Schema-- Analytics and Reports Database Schema-- Init script for analytics_db



DROP TABLE IF EXISTS user_registrations;-- Run: mysql -u root -pRohin analytics_db < init_analytics_db.sql

CREATE TABLE user_registrations (

  id BIGINT NOT NULL AUTO_INCREMENT,-- Run: Get-Content "c:\Users\2460680\OneDrive - Cognizant\Documents\END\Medicart-FS\microservices\analytics-service\db\init_analytics_db.sql" | mysql -u root -pRohin-- Run with: mysql -u root -p < this-file

  total_users BIGINT NOT NULL DEFAULT 0,

  users_today BIGINT NOT NULL DEFAULT 0,USE `analytics_db`;

  users_this_week BIGINT NOT NULL DEFAULT 0,

  users_this_month BIGINT NOT NULL DEFAULT 0,

  users_this_year BIGINT NOT NULL DEFAULT 0,

  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Table: User registrations count

  PRIMARY KEY (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;DROP TABLE IF EXISTS `user_registrations`;DROP DATABASE IF EXISTS `analytics_db`;DROP DATABASE IF EXISTS `analytics_db`;



DROP TABLE IF EXISTS revenue_details;CREATE TABLE `user_registrations` (

CREATE TABLE revenue_details (

  id BIGINT NOT NULL AUTO_INCREMENT,  `id` BIGINT NOT NULL AUTO_INCREMENT,CREATE DATABASE `analytics_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;CREATE DATABASE `analytics_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  total_revenue DOUBLE NOT NULL DEFAULT 0.0,

  revenue_today DOUBLE NOT NULL DEFAULT 0.0,  `total_users` BIGINT NOT NULL DEFAULT 0,

  revenue_this_week DOUBLE NOT NULL DEFAULT 0.0,

  revenue_this_month DOUBLE NOT NULL DEFAULT 0.0,  `users_today` BIGINT NOT NULL DEFAULT 0,USE `analytics_db`;USE `analytics_db`;

  revenue_this_year DOUBLE NOT NULL DEFAULT 0.0,

  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  `users_this_week` BIGINT NOT NULL DEFAULT 0,

  PRIMARY KEY (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;  `users_this_month` BIGINT NOT NULL DEFAULT 0,



DROP TABLE IF EXISTS order_statistics;  `users_this_year` BIGINT NOT NULL DEFAULT 0,

CREATE TABLE order_statistics (

  id BIGINT NOT NULL AUTO_INCREMENT,  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Table: User registrations count-- Analytics summary table (stores computed metrics - optional caching)

  total_orders BIGINT NOT NULL DEFAULT 0,

  orders_today BIGINT NOT NULL DEFAULT 0,  PRIMARY KEY (`id`)

  orders_this_week BIGINT NOT NULL DEFAULT 0,

  orders_this_month BIGINT NOT NULL DEFAULT 0,) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;DROP TABLE IF EXISTS `user_registrations`;DROP TABLE IF EXISTS `analytics_summary`;

  orders_this_year BIGINT NOT NULL DEFAULT 0,

  avg_order_value DOUBLE NOT NULL DEFAULT 0.0,

  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)-- Table: Revenue detailsCREATE TABLE `user_registrations` (CREATE TABLE `analytics_summary` (

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `revenue_details`;

DROP TABLE IF EXISTS top_products;

CREATE TABLE top_products (CREATE TABLE `revenue_details` (  `id` BIGINT NOT NULL AUTO_INCREMENT,  `id` BIGINT NOT NULL AUTO_INCREMENT,

  id BIGINT NOT NULL AUTO_INCREMENT,

  medicine_id BIGINT NOT NULL,  `id` BIGINT NOT NULL AUTO_INCREMENT,

  medicine_name VARCHAR(255) NOT NULL,

  total_quantity BIGINT NOT NULL DEFAULT 0,  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,  `total_users` BIGINT NOT NULL DEFAULT 0,  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,

  total_revenue DOUBLE NOT NULL DEFAULT 0.0,

  rank_position INT NOT NULL DEFAULT 0,  `revenue_today` DOUBLE NOT NULL DEFAULT 0.0,

  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),  `revenue_this_week` DOUBLE NOT NULL DEFAULT 0.0,  `users_today` BIGINT NOT NULL DEFAULT 0,  `avg_order_value` DOUBLE NOT NULL DEFAULT 0.0,

  KEY idx_rank (rank_position)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;  `revenue_this_month` DOUBLE NOT NULL DEFAULT 0.0,



DROP TABLE IF EXISTS sales_by_category;  `revenue_this_year` DOUBLE NOT NULL DEFAULT 0.0,  `users_this_week` BIGINT NOT NULL DEFAULT 0,  `total_orders` BIGINT NOT NULL DEFAULT 0,

CREATE TABLE sales_by_category (

  id BIGINT NOT NULL AUTO_INCREMENT,  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  category_name VARCHAR(255) NOT NULL,

  total_revenue DOUBLE NOT NULL DEFAULT 0.0,  PRIMARY KEY (`id`)  `users_this_month` BIGINT NOT NULL DEFAULT 0,  `orders_today` BIGINT NOT NULL DEFAULT 0,

  total_quantity BIGINT NOT NULL DEFAULT 0,

  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  PRIMARY KEY (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;  `users_this_year` BIGINT NOT NULL DEFAULT 0,  `orders_this_month` BIGINT NOT NULL DEFAULT 0,



DROP TABLE IF EXISTS order_status_distribution;-- Table: Order statistics

CREATE TABLE order_status_distribution (

  id BIGINT NOT NULL AUTO_INCREMENT,DROP TABLE IF EXISTS `order_statistics`;  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  `total_users` BIGINT NOT NULL DEFAULT 0,

  status VARCHAR(50) NOT NULL,

  count BIGINT NOT NULL DEFAULT 0,CREATE TABLE `order_statistics` (

  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)  `id` BIGINT NOT NULL AUTO_INCREMENT,  PRIMARY KEY (`id`)  `new_users_30` BIGINT NOT NULL DEFAULT 0,

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  `total_orders` BIGINT NOT NULL DEFAULT 0,

DROP TABLE IF EXISTS reports;

CREATE TABLE reports (  `orders_today` BIGINT NOT NULL DEFAULT 0,) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  id BIGINT NOT NULL AUTO_INCREMENT,

  report_type VARCHAR(100) NOT NULL,  `orders_this_week` BIGINT NOT NULL DEFAULT 0,

  report_name VARCHAR(255) NOT NULL,

  start_date DATE NULL,  `orders_this_month` BIGINT NOT NULL DEFAULT 0,  PRIMARY KEY (`id`)

  end_date DATE NULL,

  report_data TEXT NOT NULL,  `orders_this_year` BIGINT NOT NULL DEFAULT 0,

  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),  `avg_order_value` DOUBLE NOT NULL DEFAULT 0.0,-- Table: Revenue details) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  KEY idx_type (report_type),

  KEY idx_generated (generated_at)  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  PRIMARY KEY (`id`)DROP TABLE IF EXISTS `revenue_details`;

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `revenue_details` (-- End of script

-- Table: Top products

DROP TABLE IF EXISTS `top_products`;  `id` BIGINT NOT NULL AUTO_INCREMENT,

CREATE TABLE `top_products` (  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,

  `id` BIGINT NOT NULL AUTO_INCREMENT,  `revenue_today` DOUBLE NOT NULL DEFAULT 0.0,

  `medicine_id` BIGINT NOT NULL,  `revenue_this_week` DOUBLE NOT NULL DEFAULT 0.0,

  `medicine_name` VARCHAR(255) NOT NULL,  `revenue_this_month` DOUBLE NOT NULL DEFAULT 0.0,

  `total_quantity` BIGINT NOT NULL DEFAULT 0,  `revenue_this_year` DOUBLE NOT NULL DEFAULT 0.0,

  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `rank_position` INT NOT NULL DEFAULT 0,  PRIMARY KEY (`id`)

  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  PRIMARY KEY (`id`),

  KEY `idx_rank` (`rank_position`)-- Table: Order statistics

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;DROP TABLE IF EXISTS `order_statistics`;

CREATE TABLE `order_statistics` (

-- Table: Sales by category  `id` BIGINT NOT NULL AUTO_INCREMENT,

DROP TABLE IF EXISTS `sales_by_category`;  `total_orders` BIGINT NOT NULL DEFAULT 0,

CREATE TABLE `sales_by_category` (  `orders_today` BIGINT NOT NULL DEFAULT 0,

  `id` BIGINT NOT NULL AUTO_INCREMENT,  `orders_this_week` BIGINT NOT NULL DEFAULT 0,

  `category_name` VARCHAR(255) NOT NULL,  `orders_this_month` BIGINT NOT NULL DEFAULT 0,

  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,  `orders_this_year` BIGINT NOT NULL DEFAULT 0,

  `total_quantity` BIGINT NOT NULL DEFAULT 0,  `avg_order_value` DOUBLE NOT NULL DEFAULT 0.0,

  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`)  PRIMARY KEY (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Table: Order status distribution-- Table: Top products

DROP TABLE IF EXISTS `order_status_distribution`;DROP TABLE IF EXISTS `top_products`;

CREATE TABLE `order_status_distribution` (CREATE TABLE `top_products` (

  `id` BIGINT NOT NULL AUTO_INCREMENT,  `id` BIGINT NOT NULL AUTO_INCREMENT,

  `status` VARCHAR(50) NOT NULL,  `medicine_id` BIGINT NOT NULL,

  `count` BIGINT NOT NULL DEFAULT 0,  `medicine_name` VARCHAR(255) NOT NULL,

  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  `total_quantity` BIGINT NOT NULL DEFAULT 0,

  PRIMARY KEY (`id`)  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;  `rank_position` INT NOT NULL DEFAULT 0,

  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

-- Table: Generated reports  PRIMARY KEY (`id`),

DROP TABLE IF EXISTS `reports`;  KEY `idx_rank` (`rank_position`)

CREATE TABLE `reports` () ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  `id` BIGINT NOT NULL AUTO_INCREMENT,

  `report_type` VARCHAR(100) NOT NULL,-- Table: Sales by category

  `report_name` VARCHAR(255) NOT NULL,DROP TABLE IF EXISTS `sales_by_category`;

  `start_date` DATE NULL,CREATE TABLE `sales_by_category` (

  `end_date` DATE NULL,  `id` BIGINT NOT NULL AUTO_INCREMENT,

  `report_data` TEXT NOT NULL,  `category_name` VARCHAR(255) NOT NULL,

  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  `total_revenue` DOUBLE NOT NULL DEFAULT 0.0,

  PRIMARY KEY (`id`),  `total_quantity` BIGINT NOT NULL DEFAULT 0,

  KEY `idx_type` (`report_type`),  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY `idx_generated` (`generated_at`)  PRIMARY KEY (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Order status distribution
DROP TABLE IF EXISTS `order_status_distribution`;
CREATE TABLE `order_status_distribution` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `status` VARCHAR(50) NOT NULL,
  `count` BIGINT NOT NULL DEFAULT 0,
  `computed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Generated reports
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `report_type` VARCHAR(100) NOT NULL,
  `report_name` VARCHAR(255) NOT NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `report_data` TEXT NOT NULL,
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`report_type`),
  KEY `idx_generated` (`generated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- End of script

-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 192.168.1.47    Database: fraxioned
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `property_season_date`
--

DROP TABLE IF EXISTS `property_season_date`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_season_date` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `season_start` date NOT NULL,
  `season_end` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `season_id` int DEFAULT NULL,
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `property_peak_season_fk1` (`property_id`),
  KEY `season_id_fk_2_idx` (`season_id`),
  KEY `year_id_fk_1_idx` (`year_id`),
  CONSTRAINT `property_peak_season_fk1` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`),
  CONSTRAINT `season_id_fk_2` FOREIGN KEY (`season_id`) REFERENCES `season` (`id`),
  CONSTRAINT `year_id_fk_1` FOREIGN KEY (`year_id`) REFERENCES `upcoming_years` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_season_date`
--

LOCK TABLES `property_season_date` WRITE;
/*!40000 ALTER TABLE `property_season_date` DISABLE KEYS */;
INSERT INTO `property_season_date` VALUES (1,1,'2024-03-12','2024-06-30','Peak season starts by Second Tuesday of March  and ends by End of June  ',1,1),(2,2,'2024-03-12','2024-06-30','Peak season starts by Second Tuesday of March  and ends by End of June  ',1,1),(3,3,'2024-03-12','2024-06-30','Peak season starts by Second Tuesday of March  and ends by End of June  ',1,1),(4,4,'2024-03-26','2024-06-30','Peak season starts by Last Tuesday of March and ends by End of June  ',1,1),(5,5,'2024-03-26','2024-06-30','Peak season starts by Last Tuesday of March and ends by End of June  ',1,1),(6,6,'2024-06-04','2024-09-25','Peak season starts by First Tuesday of June and ends by Middle of September  ',1,1),(7,7,'2024-06-04','2024-09-25','Peak season starts by First Tuesday of June and ends by Middle of September  ',1,1),(8,8,'2024-06-04','2024-09-25','Peak season starts by First Tuesday of June and ends by Middle of September  ',1,1),(9,1,'2023-12-31','2024-03-11','Off season term 1',2,1),(10,1,'2024-07-01','2024-12-30','Off season term 2',2,1),(11,2,'2023-12-31','2024-03-11','Off season term 1',2,1),(12,2,'2024-07-01','2024-12-30','Off season term 2',2,1),(13,3,'2023-12-31','2024-03-11','Off season term 1',2,1),(14,3,'2024-07-01','2024-12-30','Off season term 2',2,1),(15,4,'2023-12-31','2024-03-25','Off season term 1',2,1),(16,4,'2024-07-01','2024-12-30','Off season term 2',2,1),(17,5,'2023-12-31','2024-03-25','Off season term 1',2,1),(18,5,'2024-07-01','2024-12-30','Off season term 2',2,1),(19,6,'2023-12-31','2024-06-03','Off season term 1',2,1),(20,6,'2024-09-26','2024-12-30','Off season term 2',2,1),(21,7,'2023-12-31','2024-06-03','Off season term 1',2,1),(22,7,'2024-09-26','2024-12-30','Off season term 2',2,1),(23,8,'2023-12-31','2024-06-03','Off season term 1',2,1),(24,8,'2024-09-26','2024-12-30','Off season term 2',2,1),(25,1,'2025-03-11','2025-06-30','Peak season starts by Second Tuesday of March  and ends by End of June',1,2),(26,2,'2025-03-11','2025-06-30','Peak season starts by Second Tuesday of March and ends by End of June',1,2),(27,3,'2025-03-11','2025-06-30','Peak season starts by Second Tuesday of March and ends by End of June',1,2),(28,4,'2025-03-25','2025-06-30','Peak season starts by Last Tuesday of March and ends by End of June',1,2),(29,5,'2025-03-25','2025-06-30','Peak season starts by Last Tuesday of March and ends by End of June',1,2),(30,6,'2025-06-03','2025-09-24','Peak season starts by First Tuesday of June and ends by Middle of September',1,2),(31,7,'2025-06-03','2025-09-24','Peak season starts by First Tuesday of June and ends by Middle of September',1,2),(32,8,'2025-06-03','2025-09-24','Peak season starts by First Tuesday of June and ends by Middle of September',1,2),(33,1,'2024-12-31','2025-03-10','Off season term 1',2,2),(34,1,'2025-07-01','2025-12-30','Off season term 2',2,2),(35,2,'2024-12-31','2025-03-10','Off season term 1',2,2),(36,2,'2025-07-01','2025-12-30','Off season term 2',2,2),(37,3,'2024-12-31','2025-03-10','Off season term 1',2,2),(38,3,'2025-07-01','2025-12-30','Off season term 2',2,2),(39,4,'2024-12-31','2025-03-24','Off season term 1',2,2),(40,4,'2025-07-01','2025-12-30','Off season term 2',2,2),(41,5,'2024-12-31','2025-03-24','Off season term 1',2,2),(42,5,'2025-07-01','2025-12-30','Off season term 2',2,2),(43,6,'2024-12-31','2025-06-02','Off season term 1',2,2),(44,6,'2025-09-25','2025-12-30','Off season term 2',2,2),(45,7,'2024-12-31','2025-06-02','Off season term 1',2,2),(46,7,'2025-09-25','2025-12-30','Off season term 2',2,2),(47,8,'2024-12-31','2025-06-02','Off season term 1',2,2),(48,8,'2025-09-25','2025-12-30','Off season term 2',2,2),(49,1,'2026-03-10','2026-06-30','Peak season starts by Second Tuesday of March  and ends by End of June',1,3),(50,2,'2026-03-10','2026-06-30','Peak season starts by Second Tuesday of March and ends by End of June',1,3),(51,3,'2026-03-10','2026-06-30','Peak season starts by Second Tuesday of March and ends by End of June',1,3),(52,4,'2026-03-31','2026-06-30','Peak season starts by Last Tuesday of March and ends by End of June',1,3),(53,5,'2026-03-31','2026-06-30','Peak season starts by Last Tuesday of March and ends by End of June',1,3),(54,6,'2026-06-02','2026-09-23','Peak season starts by First Tuesday of June and ends by Middle of September',1,3),(55,7,'2026-06-02','2026-09-23','Peak season starts by First Tuesday of June and ends by Middle of September',1,3),(56,8,'2026-06-02','2026-09-23','Peak season starts by First Tuesday of June and ends by Middle of September',1,3),(57,1,'2025-12-31','2026-03-09','Off season term 1',2,3),(58,1,'2026-07-01','2026-12-30','Off season term 2',2,3),(59,2,'2025-12-31','2026-03-09','Off season term 1',2,3),(60,2,'2026-07-01','2026-12-30','Off season term 2',2,3),(61,3,'2025-12-31','2026-03-09','Off season term 1',2,3),(62,3,'2026-07-01','2026-12-30','Off season term 2',2,3),(63,4,'2025-12-31','2026-03-30','Off season term 1',2,3),(64,4,'2026-07-01','2026-12-30','Off season term 2',2,3),(65,5,'2025-12-31','2026-03-30','Off season term 1',2,3),(66,5,'2026-07-01','2026-12-30','Off season term 2',2,3),(67,6,'2025-12-31','2026-06-01','Off season term 1',2,3),(68,6,'2026-09-24','2026-12-30','Off season term 2',2,3),(69,7,'2025-12-31','2026-06-01','Off season term 1',2,3),(70,7,'2026-09-24','2026-12-30','Off season term 2',2,3),(71,8,'2025-12-31','2026-06-01','Off season term 1',2,3),(72,8,'2026-09-24','2026-12-30','Off season term 2',2,3);
/*!40000 ALTER TABLE `property_season_date` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-09 12:13:28

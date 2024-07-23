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
-- Table structure for table `property_season_holiday`
--

DROP TABLE IF EXISTS `property_season_holiday`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_season_holiday` (
  `id` int NOT NULL,
  `property_id` int DEFAULT NULL,
  `holiday_id` int DEFAULT NULL,
  `season_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `property_id_holiday_fk_idx` (`property_id`),
  KEY `holiday_id_fk_idx` (`holiday_id`),
  KEY `season_id_holiday_fk_idx` (`season_id`),
  CONSTRAINT `holiday_id_fk` FOREIGN KEY (`holiday_id`) REFERENCES `holidays` (`id`),
  CONSTRAINT `property_id_holiday_fk` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`),
  CONSTRAINT `season_id_holiday_fk` FOREIGN KEY (`season_id`) REFERENCES `season` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_season_holiday`
--

LOCK TABLES `property_season_holiday` WRITE;
/*!40000 ALTER TABLE `property_season_holiday` DISABLE KEYS */;
INSERT INTO `property_season_holiday` VALUES (1,1,4,1),(2,1,1,2),(3,1,2,2),(4,1,3,2),(5,1,5,2),(6,1,7,2),(7,1,8,2),(8,1,9,2),(9,1,10,2),(10,2,4,1),(11,2,1,2),(12,2,2,2),(13,2,3,2),(14,2,5,2),(15,2,7,2),(16,2,8,2),(17,2,9,2),(18,2,10,2),(19,3,4,1),(20,3,1,2),(21,3,2,2),(22,3,3,2),(23,3,5,1),(24,3,7,2),(25,3,8,2),(26,3,9,2),(27,3,10,2),(28,4,4,1),(29,4,1,2),(30,4,2,2),(31,4,3,2),(32,4,5,2),(33,4,7,2),(34,4,8,2),(35,4,9,2),(36,4,10,2),(37,5,4,1),(38,5,1,2),(39,5,2,2),(40,5,3,2),(41,5,5,2),(42,5,7,2),(43,5,8,2),(44,5,9,2),(45,5,10,2),(46,6,5,1),(47,6,6,1),(48,6,7,1),(49,6,1,2),(50,6,2,2),(51,6,3,2),(52,6,4,2),(53,6,8,2),(54,6,9,2),(55,6,10,2),(56,7,5,1),(57,7,6,1),(58,7,7,1),(59,7,1,2),(60,7,2,2),(61,7,3,2),(62,7,4,2),(63,7,8,2),(64,7,9,2),(65,7,10,2),(66,8,5,1),(67,8,6,1),(68,8,7,1),(69,8,1,2),(70,8,2,2),(71,8,3,2),(72,8,4,2),(73,8,8,2),(74,8,9,2),(75,8,10,2),(76,9,5,1),(77,9,6,1),(78,9,7,1),(79,9,1,2),(80,9,2,2),(81,9,3,2),(82,9,4,2),(83,9,8,2),(84,9,9,2),(85,9,10,2),(86,10,5,1),(88,10,7,1),(89,10,1,2),(90,10,2,2),(91,10,3,2),(92,10,4,2),(93,10,8,2),(94,10,9,2),(95,10,10,2);
/*!40000 ALTER TABLE `property_season_holiday` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-23 13:57:45

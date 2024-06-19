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
INSERT INTO `property_season_date` VALUES (1,1,'2024-03-12','2024-06-30','Peak season starts by Second Tuesday of March  and ends by End of June  ',1,NULL),(2,2,'2024-03-12','2024-06-30','Peak season starts by Second Tuesday of March  and ends by End of June  ',1,NULL),(3,3,'2024-03-12','2024-06-30','Peak season starts by Second Tuesday of March  and ends by End of June  ',1,NULL),(4,4,'2024-03-26','2024-06-30','Peak season starts by Last Tuesday of March and ends by End of June  ',1,NULL),(5,5,'2024-03-26','2024-06-30','Peak season starts by Last Tuesday of March and ends by End of June  ',1,NULL),(6,6,'2024-06-04','2024-09-25','Peak season starts by First Tuesday of June and ends by Middle of September  ',1,NULL),(7,7,'2024-06-04','2024-09-25','Peak season starts by First Tuesday of June and ends by Middle of September  ',1,NULL),(8,8,'2024-06-04','2024-09-25','Peak season starts by First Tuesday of June and ends by Middle of September  ',1,NULL),(9,1,'2023-12-31','2024-03-11','Off season term 1',2,NULL),(10,1,'2024-07-01','2024-12-30','Off season term 2',2,NULL),(11,2,'2023-12-31','2024-03-11','Off season term 1',2,NULL),(12,2,'2024-07-01','2024-12-30','Off season term 2',2,NULL),(13,3,'2023-12-31','2024-03-11','Off season term 1',2,NULL),(14,3,'2024-07-01','2024-12-30','Off season term 2',2,NULL),(15,4,'2023-12-31','2024-03-25','Off season term 1',2,NULL),(16,4,'2024-07-01','2024-12-30','Off season term 2',2,NULL),(17,5,'2023-12-31','2024-03-25','Off season term 1',2,NULL),(18,5,'2024-07-01','2024-12-30','Off season term 2',2,NULL),(19,6,'2023-12-31','2024-06-03','Off season term 1',2,NULL),(20,6,'2024-09-26','2024-12-30','Off season term 2',2,NULL),(21,7,'2023-12-31','2024-06-03','Off season term 1',2,NULL),(22,7,'2024-09-26','2024-12-30','Off season term 2',2,NULL),(23,8,'2023-12-31','2024-06-03','Off season term 1',2,NULL),(24,8,'2024-09-26','2024-12-30','Off season term 2',2,NULL);
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

-- Dump completed on 2024-06-19 10:29:07

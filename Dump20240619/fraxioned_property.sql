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
-- Table structure for table `property`
--

DROP TABLE IF EXISTS `property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `property_type` int NOT NULL,
  `PSAN` int DEFAULT NULL,
  `OSAN` int DEFAULT NULL,
  `PSAHN` int DEFAULT NULL,
  `OSAHN` int DEFAULT NULL,
  `no_of_pets_allowed` int DEFAULT NULL,
  `fee_per_pet` int DEFAULT NULL,
  `no_of_guests_allowed` int DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `checkin_time` varchar(45) DEFAULT NULL,
  `checkout_time` varchar(45) DEFAULT NULL,
  `share_id` int DEFAULT NULL,
  `PSAN_term` int NOT NULL DEFAULT '1',
  `OSAN_term` int NOT NULL DEFAULT '1',
  `PSAHN_term` int NOT NULL DEFAULT '2',
  `OSAHN_term` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `property_fk2` (`property_type`),
  KEY `share_id_fk_1` (`share_id`),
  CONSTRAINT `property_fk2` FOREIGN KEY (`property_type`) REFERENCES `property_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property`
--

LOCK TABLES `property` WRITE;
/*!40000 ALTER TABLE `property` DISABLE KEYS */;
INSERT INTO `property` VALUES (1,'Paradise Shores (1/8)',1,15,30,1,1,2,0,24,'St. George','5367 South Cyan Lane','Utah','United States','84790',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:45','4:00pm','11:00am',1,1,1,2,1),(2,'Paradise Shores (1/10)',1,7,30,1,1,2,0,24,'St. George','5367 South Cyan Lane','Utah','United States','84790',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:48','4:00pm','11:00am',2,1,1,2,1),(3,'The Crown Jewel',1,15,30,1,1,2,50,14,'St. George','5409 South Aquamarine Lane','Utah','United States','84790',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:51','4:00pm','11:00am',1,1,1,2,1),(4,'Modern Lagoon',1,7,21,1,1,2,0,32,'St. George','833 Savoy Lane','Utah','United States','84790',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:53','4:00pm','11:00am',3,1,1,2,1),(5,'The Oasis',1,7,21,1,1,2,0,40,'Hurricane','4273 W. Cambridge Parkway','Utah','United States','84737',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:54','4:00pm','11:00am',3,1,1,2,1),(6,'Bear Lake Bluffs',1,15,30,1,1,2,50,16,'Garden City','732 Spruce Drive','Utah','United States','84028',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:57','4:00pm','11:00am',1,1,1,2,1),(7,'Swan Creek',2,15,30,1,1,2,50,18,'Garden City','1343 N. Trapper Ln','Utah','United States','84028',1,'2024-06-13 09:51:37',1,'2024-06-18 10:32:58','4:00pm','11:00am',1,1,1,2,1),(8,'Blue Bear Lake',1,15,30,1,1,2,50,9,'Garden City','537 Blue Lake St','Utah','United States','84028',1,'2024-06-13 09:51:37',1,'2024-06-18 10:33:00','4:00pm','11:00am',1,1,1,2,1);
/*!40000 ALTER TABLE `property` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-19 10:29:04

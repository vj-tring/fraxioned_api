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
  `rental_type` int NOT NULL,
  `share_id` int DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  `no_of_guests_allowed` int DEFAULT NULL,
  `no_of_bedrooms` int DEFAULT NULL,
  `no_of_bathrooms` int DEFAULT NULL,
  `square_footage` varchar(45) DEFAULT NULL,
  `checkin_time` varchar(45) DEFAULT NULL,
  `checkout_time` varchar(45) DEFAULT NULL,
  `house_description` varchar(255) DEFAULT NULL,
  `checkout_instructions` varchar(255) DEFAULT NULL,
  `cleaning_fee` int DEFAULT NULL,
  `no_of_pets_allowed` int DEFAULT NULL,
  `pet_policy` varchar(45) DEFAULT NULL,
  `fee_per_pet` int DEFAULT NULL,
  `peak_allotted_nights` int DEFAULT NULL,
  `off_allotted_nights` int DEFAULT NULL,
  `peak_allotted_holiday_nights` int DEFAULT NULL,
  `off_allotted_holiday_nights` int DEFAULT NULL,
  `last_minute_allotted_nights` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `peak_season_term` int NOT NULL DEFAULT '1',
  `off_season_term` int NOT NULL DEFAULT '1',
  `peak_season_holiday_term` int NOT NULL DEFAULT '2',
  `off_season_holiday_term` int NOT NULL DEFAULT '1',
  `last_minute_booking_term` int DEFAULT NULL,
  `cancellation_day_limit` int NOT NULL DEFAULT '7',
  `map_coordinates` point DEFAULT NULL,
  `is_refund_cancellation_available` tinyint DEFAULT NULL,
  `cancellation_days_before` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `property_fk2` (`rental_type`),
  KEY `share_id_fk_1` (`share_id`),
  CONSTRAINT `property_fk2` FOREIGN KEY (`rental_type`) REFERENCES `rental_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property`
--

LOCK TABLES `property` WRITE;
/*!40000 ALTER TABLE `property` DISABLE KEYS */;
INSERT INTO `property` VALUES (1,'Paradise Shores (1/8)',1,2,'St. George','5367 South Cyan Lane','Utah','United States','84790',24,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,0,15,30,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:07:23',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0˜\Þþ\\4e\\À:\æ<c_ŒB@',NULL,NULL),(3,'The Crown Jewel',1,1,'St. George','5409 South Aquamarine Lane','Utah','United States','84790',14,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,50,15,30,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:08:50',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0‡¥e\\ÀzýI|ŒB@',NULL,NULL),(4,'Modern Lagoon',1,3,'St. George','833 Savoy Lane','Utah','United States','84790',32,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,0,7,21,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:08:44',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0ž^)\Ëe\\Àú™zÝŒB@',NULL,NULL),(5,'The Oasis',1,3,'Hurricane','4273 W. Cambridge Parkway','Utah','United States','84737',40,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,0,7,21,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:08:38',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0õ9D\ÜR\\ÀÝ—3Û—B@',NULL,NULL),(6,'Bear Lake Bluffs',1,1,'Garden City','732 Spruce Drive','Utah','United States','84028',16,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,50,15,30,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:08:29',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0$\î±ô¡\×[À/ˆHM÷D@',NULL,NULL),(7,'Swan Creek',2,1,'Garden City','1343 N. Trapper Ln','Utah','United States','84028',18,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,50,15,30,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:08:21',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0‹·˜Ÿ\×[À\ß\Ý\Ê÷D@',NULL,NULL),(8,'Blue Bear Lake',1,1,'Garden City','537 Blue Lake St','Utah','United States','84028',9,NULL,NULL,NULL,'4:00pm','11:00am',NULL,NULL,NULL,2,NULL,50,15,30,1,1,8,1,'2024-06-13 04:21:37',1,'2024-07-18 08:08:12',1,1,2,1,1,7,_binary '\0\0\0\0\0\0\0\É:]¥\×[ÀYk(µ÷D@',NULL,NULL);
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

-- Dump completed on 2024-07-18 13:59:14
